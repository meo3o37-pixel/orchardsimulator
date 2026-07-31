from __future__ import annotations

import copy
import re
import sys
import zipfile
from io import BytesIO
import xml.etree.ElementTree as ET


P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
PR_NS = "http://schemas.openxmlformats.org/package/2006/relationships"

NS = {"p": P_NS, "a": A_NS, "r": R_NS, "ct": CT_NS, "pr": PR_NS}
ET.register_namespace("a", A_NS)
ET.register_namespace("p", P_NS)
ET.register_namespace("r", R_NS)


CLOSING_TEXTS = [
    "마무리",
    "감사합니다",
    "실제 창농을 준비하며 느낀 고민을 게임으로 풀어낸 경험이,\n청년농으로서의 제 방향과 노하우를 더 구체화하는 계기가 되었습니다.",
    "핵심 정리",
    "이 게임은 단순 오락이 아니라 청년농이 실제로 겪게 될 자금, 토지, 운영 판단을 미리 체험하게 하는 현실형 콘텐츠입니다.",
    "앞으로의 계획",
    "육성자금 배정 이후 토지 매입과 다축묘 과원 조성을 실제로 진행하며, 게임도 함께 현실성 있게 계속 보완해 나가겠습니다.",
    "전하고 싶은 말",
    "농업은 쉽게 보이는 일이 아니라 끝까지 준비하고 책임져야 하는 일이라는 점을,\n게임과 실제 창농 준비를 함께 통해 보여드리고 싶었습니다.",
    "경청해 주셔서 감사합니다.",
]


def slide_text_shapes(slide_root: ET.Element) -> list[ET.Element]:
    shapes: list[ET.Element] = []
    for sp in slide_root.findall(".//p:sp", NS):
        if sp.findall(".//a:t", NS):
            shapes.append(sp)
    return shapes


def replace_shape_text(shape: ET.Element, new_text: str) -> None:
    tx_body = shape.find("p:txBody", NS)
    if tx_body is None:
        return

    paragraphs = tx_body.findall("a:p", NS)
    template_paragraph = paragraphs[0] if paragraphs else ET.Element(f"{{{A_NS}}}p")
    template_run_props = template_paragraph.find(".//a:rPr", NS)
    template_end_props = template_paragraph.find("a:endParaRPr", NS)
    template_paragraph_props = template_paragraph.find("a:pPr", NS)

    for child in list(tx_body):
        if child.tag == f"{{{A_NS}}}p":
            tx_body.remove(child)

    lines = str(new_text).split("\n")
    for line in lines:
        paragraph = ET.Element(f"{{{A_NS}}}p")
        if template_paragraph_props is not None:
            paragraph.append(copy.deepcopy(template_paragraph_props))
        run = ET.SubElement(paragraph, f"{{{A_NS}}}r")
        if template_run_props is not None:
            run.append(copy.deepcopy(template_run_props))
        else:
            ET.SubElement(run, f"{{{A_NS}}}rPr")
        text_el = ET.SubElement(run, f"{{{A_NS}}}t")
        if line.startswith(" ") or line.endswith(" "):
            text_el.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        text_el.text = line
        if template_end_props is not None:
            paragraph.append(copy.deepcopy(template_end_props))
        else:
            ET.SubElement(paragraph, f"{{{A_NS}}}endParaRPr")
        tx_body.append(paragraph)


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: append_closing_slide.py <input.pptx> <output.pptx>")
        return 1

    input_path, output_path = sys.argv[1], sys.argv[2]

    with zipfile.ZipFile(input_path, "r") as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    slide_names = sorted(
        [name for name in files if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)],
        key=lambda name: int(re.search(r"slide(\d+)\.xml", name).group(1)),
    )
    if not slide_names:
        raise RuntimeError("No slides found.")

    last_slide_name = slide_names[-1]
    last_slide_num = int(re.search(r"slide(\d+)\.xml", last_slide_name).group(1))
    new_slide_num = last_slide_num + 1
    new_slide_name = f"ppt/slides/slide{new_slide_num}.xml"

    slide_root = ET.fromstring(files[last_slide_name])
    shapes = slide_text_shapes(slide_root)
    for shape, text in zip(shapes, CLOSING_TEXTS):
        replace_shape_text(shape, text)
    files[new_slide_name] = ET.tostring(slide_root, encoding="utf-8", xml_declaration=True)

    last_rel_name = f"ppt/slides/_rels/slide{last_slide_num}.xml.rels"
    new_rel_name = f"ppt/slides/_rels/slide{new_slide_num}.xml.rels"
    if last_rel_name in files:
        files[new_rel_name] = files[last_rel_name]

    presentation = ET.fromstring(files["ppt/presentation.xml"])
    sld_id_list = presentation.find("p:sldIdLst", NS)
    if sld_id_list is None:
        raise RuntimeError("presentation.xml missing sldIdLst")
    existing_ids = [int(node.get("id")) for node in sld_id_list.findall("p:sldId", NS)]
    max_slide_id = max(existing_ids)

    presentation_rels = ET.fromstring(files["ppt/_rels/presentation.xml.rels"])
    rel_nodes = presentation_rels.findall("pr:Relationship", NS)
    slide_rel_ids = []
    for rel in rel_nodes:
        rid = rel.get("Id", "")
        match = re.fullmatch(r"rId(\d+)", rid)
        if match:
            slide_rel_ids.append(int(match.group(1)))
    new_rid = f"rId{max(slide_rel_ids) + 1}"

    new_sld = ET.Element(f"{{{P_NS}}}sldId")
    new_sld.set("id", str(max_slide_id + 1))
    new_sld.set(f"{{{R_NS}}}id", new_rid)
    sld_id_list.append(new_sld)
    files["ppt/presentation.xml"] = ET.tostring(presentation, encoding="utf-8", xml_declaration=True)

    new_rel = ET.Element(f"{{{PR_NS}}}Relationship")
    new_rel.set("Id", new_rid)
    new_rel.set("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide")
    new_rel.set("Target", f"slides/slide{new_slide_num}.xml")
    presentation_rels.append(new_rel)
    files["ppt/_rels/presentation.xml.rels"] = ET.tostring(
        presentation_rels, encoding="utf-8", xml_declaration=True
    )

    content_types = ET.fromstring(files["[Content_Types].xml"])
    override_part = f"/ppt/slides/slide{new_slide_num}.xml"
    exists = any(
        node.get("PartName") == override_part
        for node in content_types.findall("ct:Override", NS)
    )
    if not exists:
        override = ET.Element(f"{{{CT_NS}}}Override")
        override.set("PartName", override_part)
        override.set(
            "ContentType",
            "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
        )
        content_types.append(override)
        files["[Content_Types].xml"] = ET.tostring(content_types, encoding="utf-8", xml_declaration=True)

    out_buffer = BytesIO()
    with zipfile.ZipFile(out_buffer, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)

    with open(output_path, "wb") as f:
        f.write(out_buffer.getvalue())

    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
