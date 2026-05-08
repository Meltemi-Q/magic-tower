from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(r"C:\Users\meltemi\.codex\generated_images")
START = datetime(2026, 5, 8, 19, 28, 0).timestamp()
OUT = Path("tmp/hero_ai_candidates.png")


def main():
    images = [p for p in ROOT.rglob("*.png") if p.stat().st_mtime >= START]
    images.sort(key=lambda p: p.stat().st_mtime)

    thumb = 160
    label_h = 28
    cols = 4
    rows = (len(images) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * thumb, rows * (thumb + label_h)), (30, 30, 30, 255))
    draw = ImageDraw.Draw(sheet)

    for index, path in enumerate(images):
        image = Image.open(path).convert("RGBA")
        image.thumbnail((thumb, thumb), Image.Resampling.LANCZOS)
        x = (index % cols) * thumb + (thumb - image.width) // 2
        y = (index // cols) * (thumb + label_h) + (thumb - image.height) // 2
        sheet.alpha_composite(image, (x, y))
        label = f"{index:02d} {datetime.fromtimestamp(path.stat().st_mtime):%H:%M:%S}"
        draw.text(
            ((index % cols) * thumb + 4, (index // cols) * (thumb + label_h) + thumb + 4),
            label,
            fill=(255, 255, 255, 255),
        )

    OUT.parent.mkdir(exist_ok=True)
    sheet.save(OUT)

    for index, path in enumerate(images):
        print(f"{index:02d}\t{datetime.fromtimestamp(path.stat().st_mtime):%H:%M:%S}\t{path}")
    print(OUT)


if __name__ == "__main__":
    main()
