from __future__ import annotations

import sys
import zipfile
from io import BytesIO
from pathlib import Path
import xml.etree.ElementTree as ET


A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
NS = {"a": A_NS, "p": P_NS}
ET.register_namespace("a", A_NS)
ET.register_namespace("p", P_NS)

FONT_NAME = "맑은 고딕"
FONT_COLOR = "000000"


def replace_fill(parent: ET.Element) -> None:
    for child in list(parent):
        if child.tag in {
            f"{{{A_NS}}}solidFill",
            f"{{{A_NS}}}gradFill",
            f"{{{A_NS}}}noFill",
            f"{{{A_NS}}}pattFill",
            f"{{{A_NS}}}blipFill",
            f"{{{A_NS}}}grpFill",
        }:
            parent.remove(child)
    solid_fill = ET.Element(f"{{{A_NS}}}solidFill")
    srgb = ET.SubElement(solid_fill, f"{{{A_NS}}}srgbClr")
    srgb.set("val", FONT_COLOR)
    parent.append(solid_fill)


def set_font_children(parent: ET.Element) -> None:
    for tag_name in ("latin", "ea", "cs"):
        child = parent.find(f"a:{tag_name}", NS)
        if child is None:
            child = ET.SubElement(parent, f"{{{A_NS}}}{tag_name}")
        child.set("typeface", FONT_NAME)


def normalize_text_props(root: ET.Element) -> bool:
    changed = False
    for xpath in (".//a:rPr", ".//a:defRPr", ".//a:endParaRPr"):
        for prop in root.findall(xpath, NS):
            set_font_children(prop)
            replace_fill(prop)
            changed = True
    return changed


def normalize_theme(root: ET.Element) -> bool:
    changed = False
    for xpath in (
        ".//a:themeElements/a:fontScheme/a:majorFont",
        ".//a:themeElements/a:fontScheme/a:minorFont",
    ):
        for font_group in root.findall(xpath, NS):
            for tag_name in ("latin", "ea", "cs"):
                child = font_group.find(f"a:{tag_name}", NS)
                if child is None:
                    child = ET.SubElement(font_group, f"{{{A_NS}}}{tag_name}")
                child.set("typeface", FONT_NAME)
                changed = True
    return changed


def process_xml(data: bytes, arcname: str) -> bytes:
    root = ET.fromstring(data)
    changed = normalize_text_props(root)
    if arcname.startswith("ppt/theme/"):
        changed = normalize_theme(root) or changed
    if not changed:
        return data
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: fix_ppt_font_color.py <input.pptx> <output.pptx>")
        return 1

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    output_path.parent.mkdir(parents=True, exist_ok=True)

    buffer = BytesIO()
    with zipfile.ZipFile(input_path, "r") as src, zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as dst:
        for info in src.infolist():
            raw = src.read(info.filename)
            if info.filename.endswith(".xml") and info.filename.startswith("ppt/"):
                raw = process_xml(raw, info.filename)
            dst.writestr(info, raw)

    output_path.write_bytes(buffer.getvalue())
    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
