from __future__ import annotations

import argparse
import shutil
from collections import deque
from pathlib import Path

from PIL import Image, ImageEnhance


FRAME = 128
COLUMNS = 4
FACINGS = ("down", "left", "right", "up")
ACTIONS = ("idle", "walk", "attack")
ROWS = tuple((action, facing) for action in ACTIONS for facing in FACINGS)
SHEET_SIZE = (FRAME * COLUMNS, FRAME * len(ROWS))

# The image generation calls were made in this order.
SOURCE_ORDER = (
    ("down", "idle"),
    ("down", "walk"),
    ("down", "attack"),
    ("left", "idle"),
    ("left", "walk"),
    ("left", "attack"),
    ("right", "idle"),
    ("right", "walk"),
    ("right", "attack"),
    ("up", "idle"),
    ("up", "walk"),
    ("up", "attack"),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build the AI-generated 4x12 hero sprite sheet."
    )
    parser.add_argument("--source-dir", required=True, help="Directory with 12 generated PNGs.")
    parser.add_argument(
        "--sheet-out",
        default="assets/sprites/hero.png",
        help="Output 512x1536 sprite sheet.",
    )
    parser.add_argument(
        "--frame-out-dir",
        default="tmp/hero-ai-frames",
        help="Directory for processed 128x128 source frames.",
    )
    parser.add_argument(
        "--preview-out",
        default="tmp/hero-ai-sheet-preview.png",
        help="Preview contact sheet output.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source_dir = Path(args.source_dir)
    paths = sorted(source_dir.glob("*.png"), key=lambda p: p.stat().st_mtime)
    if len(paths) != len(SOURCE_ORDER):
        raise SystemExit(f"Expected 12 generated PNGs, found {len(paths)} in {source_dir}")

    frame_out_dir = Path(args.frame_out_dir)
    frame_out_dir.mkdir(parents=True, exist_ok=True)

    base_frames: dict[tuple[str, str], Image.Image] = {}
    for path, (facing, action) in zip(paths, SOURCE_ORDER):
        key = (action, facing)
        shutil.copy2(path, frame_out_dir / f"source_{action}_{facing}.png")
        frame = make_tile(path, action)
        frame.save(frame_out_dir / f"{action}_{facing}.png")
        base_frames[key] = frame

    sheet = Image.new("RGBA", SHEET_SIZE, (0, 0, 0, 0))
    for row, (action, facing) in enumerate(ROWS):
        base = base_frames[(action, facing)]
        for col in range(COLUMNS):
            frame = make_animation_frame(base, action, facing, col)
            sheet.alpha_composite(frame, (col * FRAME, row * FRAME))

    sheet_out = Path(args.sheet_out)
    sheet_out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(sheet_out)

    preview_out = Path(args.preview_out)
    preview_out.parent.mkdir(parents=True, exist_ok=True)
    build_preview(sheet).save(preview_out)

    with Image.open(sheet_out) as verify:
        if verify.size != SHEET_SIZE:
            raise SystemExit(f"Unexpected sheet size: {verify.size}, expected {SHEET_SIZE}")
        if verify.mode != "RGBA":
            raise SystemExit(f"Unexpected sheet mode: {verify.mode}, expected RGBA")
    print(f"Wrote {sheet_out} {SHEET_SIZE[0]}x{SHEET_SIZE[1]} RGBA")
    print(f"Wrote processed frames to {frame_out_dir}")
    print(f"Wrote preview to {preview_out}")


def make_tile(path: Path, action: str) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    image = remove_chroma_background(image)
    bbox = image.getbbox()
    if bbox is None:
        raise ValueError(f"No visible pixels after background removal: {path}")

    cropped = image.crop(expand_bbox(bbox, image.size, 18))
    max_side = 118 if action != "attack" else 122
    scale = min(max_side / cropped.width, max_side / cropped.height)
    resized = cropped.resize(
        (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
        Image.Resampling.LANCZOS,
    )
    resized = ImageEnhance.Sharpness(resized).enhance(1.18)

    tile = Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))
    x = (FRAME - resized.width) // 2
    y = min(max(4, 122 - resized.height), FRAME - resized.height)
    tile.alpha_composite(resized, (x, y))
    return tile


def remove_chroma_background(image: Image.Image) -> Image.Image:
    width, height = image.size
    key = estimate_key_color(image)
    threshold_sq = 72 * 72
    pixels = image.load()
    bg = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def index(x: int, y: int) -> int:
        return y * width + x

    def is_key(x: int, y: int) -> bool:
        r, g, b, _ = pixels[x, y]
        return (r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2 <= threshold_sq

    for x in range(width):
        for y in (0, height - 1):
            if is_key(x, y) and not bg[index(x, y)]:
                bg[index(x, y)] = 1
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if is_key(x, y) and not bg[index(x, y)]:
                bg[index(x, y)] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                i = index(nx, ny)
                if not bg[i] and is_key(nx, ny):
                    bg[i] = 1
                    queue.append((nx, ny))

    out = image.copy()
    out_pixels = out.load()
    for y in range(height):
        for x in range(width):
            if bg[index(x, y)]:
                out_pixels[x, y] = (0, 0, 0, 0)
    return out


def estimate_key_color(image: Image.Image) -> tuple[int, int, int]:
    width, height = image.size
    samples = [
        image.getpixel((0, 0))[:3],
        image.getpixel((width - 1, 0))[:3],
        image.getpixel((0, height - 1))[:3],
        image.getpixel((width - 1, height - 1))[:3],
    ]
    return tuple(round(sum(sample[i] for sample in samples) / len(samples)) for i in range(3))


def expand_bbox(
    bbox: tuple[int, int, int, int], size: tuple[int, int], padding: int
) -> tuple[int, int, int, int]:
    left, top, right, bottom = bbox
    width, height = size
    return (
        max(0, left - padding),
        max(0, top - padding),
        min(width, right + padding),
        min(height, bottom + padding),
    )


def make_animation_frame(base: Image.Image, action: str, facing: str, col: int) -> Image.Image:
    dx, dy = frame_offset(action, facing, col)
    shifted = shift_frame(base, dx, dy)
    if action == "attack" and col in (1, 2):
        ghost_dx, ghost_dy = frame_offset(action, facing, max(0, col - 1))
        ghost = shift_frame(base, ghost_dx, ghost_dy)
        alpha = ghost.getchannel("A").point(lambda a: round(a * 0.22))
        ghost.putalpha(alpha)
        result = Image.new("RGBA", base.size, (0, 0, 0, 0))
        result.alpha_composite(ghost)
        result.alpha_composite(shifted)
        return result
    return shifted


def frame_offset(action: str, facing: str, col: int) -> tuple[int, int]:
    if action == "idle":
        return ((0, 0), (0, -2), (0, 0), (0, 1))[col]
    if action == "walk":
        if facing == "left":
            return ((0, 0), (-2, -1), (-4, 0), (-1, 1))[col]
        if facing == "right":
            return ((0, 0), (2, -1), (4, 0), (1, 1))[col]
        if facing == "up":
            return ((0, 0), (0, -2), (0, -4), (0, -1))[col]
        return ((0, 0), (0, 2), (0, 4), (0, 1))[col]
    if facing == "left":
        return ((0, 0), (-4, 0), (-7, 0), (-2, 0))[col]
    if facing == "right":
        return ((0, 0), (4, 0), (7, 0), (2, 0))[col]
    if facing == "up":
        return ((0, 0), (0, -4), (0, -7), (0, -2))[col]
    return ((0, 0), (0, 4), (0, 7), (0, 2))[col]


def shift_frame(image: Image.Image, dx: int, dy: int) -> Image.Image:
    out = Image.new("RGBA", image.size, (0, 0, 0, 0))
    sx1 = max(0, -dx)
    sy1 = max(0, -dy)
    sx2 = min(image.width, image.width - dx)
    sy2 = min(image.height, image.height - dy)
    if sx2 <= sx1 or sy2 <= sy1:
        return out
    region = image.crop((sx1, sy1, sx2, sy2))
    out.alpha_composite(region, (max(0, dx), max(0, dy)))
    return out


def build_preview(sheet: Image.Image) -> Image.Image:
    cell = 64
    preview = Image.new("RGBA", (cell * COLUMNS, cell * len(ROWS)), (32, 32, 32, 255))
    small = sheet.resize(preview.size, Image.Resampling.NEAREST)
    preview.alpha_composite(small)
    return preview


if __name__ == "__main__":
    main()
