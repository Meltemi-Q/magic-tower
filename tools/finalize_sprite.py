from __future__ import annotations

import argparse
import colorsys
from pathlib import Path

from PIL import Image


SHEET_SIZE = (512, 384)
FRAME_SIZE = (128, 128)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Finalize generated transparent sprite sheets for the game."
    )
    parser.add_argument("--input", required=True, help="Transparent source PNG.")
    parser.add_argument("--sheet-out", required=True, help="Output 4x3 sprite sheet PNG.")
    parser.add_argument("--icon-out", required=True, help="Output first-frame icon PNG.")
    parser.add_argument(
        "--variant",
        choices=["none", "red-slime"],
        default="none",
        help="Optional color variant to apply before writing outputs.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    image = Image.open(args.input).convert("RGBA")
    sheet = image.resize(SHEET_SIZE, Image.Resampling.LANCZOS)

    if args.variant == "red-slime":
        sheet = make_red_slime(sheet)

    write_png(sheet, args.sheet_out)
    write_png(sheet.crop((0, 0, *FRAME_SIZE)), args.icon_out)


def make_red_slime(image: Image.Image) -> Image.Image:
    out = Image.new("RGBA", image.size)
    src = image.load()
    dst = out.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = src[x, y]
            if a == 0:
                dst[x, y] = (0, 0, 0, 0)
                continue

            value = max(r, g, b) / 255
            is_green_slime = g > r * 1.08 and g > b * 1.05 and value > 0.16
            if not is_green_slime:
                dst[x, y] = (r, g, b, a)
                continue

            _, saturation, value = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            hue = 0.985 if value > 0.42 else 0.955
            nr, ng, nb = colorsys.hsv_to_rgb(hue, min(1, saturation * 1.08), value * 0.98)
            dst[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255), a)

    return out


def write_png(image: Image.Image, path: str) -> None:
    output = Path(path)
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output)


if __name__ == "__main__":
    main()
