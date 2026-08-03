from collections import deque
from pathlib import Path

from PIL import Image


src = Path(r"C:\Users\Win11_UEFI\.codex\generated_images\019fc144-1d38-7071-a228-bc683094d0eb\call_aC0tOftqirsnen4jXNK9kmA8.png")
out_src = Path("tmp/imagegen/housing_waste_dirty_dishes_chroma.png")
out_src.parent.mkdir(parents=True, exist_ok=True)
out_src.write_bytes(src.read_bytes())

im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()


def is_key(x, y):
    r, g, b, a = px[x, y]
    return a > 0 and g > 125 and g > r * 1.35 and g > b * 1.35 and (g - max(r, b)) > 45


visited = bytearray(w * h)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if is_key(x, y):
            visited[y * w + x] = 1
            q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if not visited[y * w + x] and is_key(x, y):
            visited[y * w + x] = 1
            q.append((x, y))

while q:
    x, y = q.popleft()
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[ny * w + nx] and is_key(nx, ny):
            visited[ny * w + nx] = 1
            q.append((nx, ny))

rgba = im.copy()
rp = rgba.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = rp[x, y]
        if visited[y * w + x]:
            rp[x, y] = (r, g, b, 0)
            continue
        if g > r * 1.18 and g > b * 1.18 and g - max(r, b) > 25:
            g = int((r + b) / 2)
        rp[x, y] = (r, g, b, a)

items = [
    ("생활쓰레기", Path("src/assets/images/아이템/폐기물/생활쓰레기.png"), (0, 0, w // 2, h // 2)),
    ("음식물 쓰레기", Path("src/assets/images/아이템/폐기물/음식물 쓰레기.png"), (w // 2, 0, w, h // 2)),
    ("재활용 쓰레기", Path("src/assets/images/아이템/폐기물/재활용 쓰레기.png"), (0, h // 2, w // 2, h)),
    ("더러워진 식기", Path("src/assets/images/아이템/주방용품/더러워진 식기.png"), (w // 2, h // 2, w, h)),
]

contact = Image.new("RGBA", (256 * 4, 256), (255, 255, 255, 255))
for idx, (name, out, box) in enumerate(items):
    cell = rgba.crop(box)
    bbox = cell.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"no object bbox for {name}")
    pad = 24
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(cell.width, r + pad)
    b = min(cell.height, b + pad)
    crop = cell.crop((l, t, r, b))
    scale = min(224 / crop.width, 224 / crop.height)
    nw = max(1, int(crop.width * scale))
    nh = max(1, int(crop.height * scale))
    resized = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((256 - nw) // 2, (256 - nh) // 2))
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out)
    contact.alpha_composite(canvas, (idx * 256, 0))

contact.save("tmp/imagegen/housing_waste_dirty_dishes_contact.png")
print("saved")
for _, out, _ in items:
    print(out)
