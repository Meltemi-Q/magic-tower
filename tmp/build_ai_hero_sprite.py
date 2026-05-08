from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


ROOT = Path(r"C:\Users\meltemi\.codex\generated_images")
OUT_DIR = Path("tmp/hero_ai_frames")
SPRITE_OUT = Path("assets/sprites/hero.png")
PORTRAIT_OUT = Path("assets/hero.png")
PREVIEW_OUT = Path("tmp/hero_ai_sheet_preview.png")
CELLS_OUT = Path("tmp/hero_ai_cells_preview.png")

FRAME = 128
COLS = 4
ROWS = 12

# Candidate indices from tmp/hero_ai_candidates.png, mapped to the required row order:
# idle down/left/right/up, walk down/left/right/up, attack down/left/right/up.
SELECTED = [5, 1, 2, 3, 24, 7, 9, 11, 13, 14, 18, 20]
LABELS = [
    ("idle", "down"),
    ("idle", "left"),
    ("idle", "right"),
    ("idle", "up"),
    ("walk", "down"),
    ("walk", "left"),
    ("walk", "right"),
    ("walk", "up"),
    ("attack", "down"),
    ("attack", "left"),
    ("attack", "right"),
    ("attack", "up"),
]


def recent_generated_images() -> list[Path]:
    start = datetime(2026, 5, 8, 19, 28, 0).timestamp()
    images = [path for path in ROOT.rglob("*.png") if path.stat().st_mtime >= start]
    return sorted(images, key=lambda path: path.stat().st_mtime)


def remove_chroma_key(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    sample_points = [
        (0, 0),
        (width - 1, 0),
        (0, height - 1),
        (width - 1, height - 1),
        (width // 2, 0),
        (width // 2, height - 1),
        (0, height // 2),
        (width - 1, height // 2),
    ]
    samples = [pixels[x, y][:3] for x, y in sample_points]
    key = max(set(samples), key=samples.count)

    out = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    out_pixels = out.load()
    kr, kg, kb = key
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            dist = ((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2) ** 0.5
            if dist < 54:
                alpha = 0
            elif dist < 124:
                alpha = int(a * (dist - 54) / 70)
            else:
                alpha = a
            if alpha:
                out_pixels[x, y] = (r, g, b, alpha)
    return out


def trim_and_fit(image: Image.Image, row: int) -> Image.Image:
    bbox = image.getbbox()
    if not bbox:
        return Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))

    cropped = image.crop(bbox)
    action, direction = LABELS[row]
    max_w = 112 if action != "attack" else 120
    max_h = 108 if action != "attack" else 114

    scale = min(max_w / cropped.width, max_h / cropped.height)
    new_size = (
        max(1, round(cropped.width * scale)),
        max(1, round(cropped.height * scale)),
    )
    resized = cropped.resize(new_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))
    baseline = 116
    x = (FRAME - resized.width) // 2
    y = baseline - resized.height

    if direction == "up":
        y += 2
    if action == "attack":
        if direction == "left":
            x -= 4
        elif direction == "right":
            x += 4
        elif direction == "down":
            y += 2
        elif direction == "up":
            y -= 2

    canvas.alpha_composite(resized, (x, y))
    return canvas


def paste_shifted(base: Image.Image, dx: int, dy: int) -> Image.Image:
    shifted = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shifted.alpha_composite(base, (dx, dy))
    return shifted


def add_slash(frame: Image.Image, direction: str, intensity: int = 1) -> Image.Image:
    out = frame.copy()
    draw = ImageDraw.Draw(out, "RGBA")
    white = (246, 248, 255, 185 if intensity == 1 else 225)
    blue = (100, 190, 255, 110 if intensity == 1 else 150)
    gold = (255, 218, 92, 95 if intensity == 1 else 130)

    if direction == "down":
        lines = [((35, 83), (93, 112)), ((44, 91), (104, 116)), ((57, 99), (89, 121))]
    elif direction == "left":
        lines = [((16, 70), (70, 39)), ((20, 81), (73, 50)), ((12, 92), (58, 61))]
    elif direction == "right":
        lines = [((58, 39), (112, 70)), ((55, 50), (108, 81)), ((70, 61), (116, 92))]
    else:
        lines = [((38, 44), (91, 18)), ((49, 52), (102, 26)), ((60, 59), (94, 35))]

    for start, end in lines:
        draw.line((start, end), fill=blue, width=5)
    for start, end in lines[:2]:
        draw.line((start, end), fill=white, width=3)
    draw.line((lines[0][0], lines[-1][1]), fill=gold, width=1)
    return out


def animation_frames(base: Image.Image, action: str, direction: str) -> list[Image.Image]:
    if action == "idle":
        offsets = [(0, 0), (0, -1), (0, 0), (0, 1)]
        return [paste_shifted(base, dx, dy) for dx, dy in offsets]

    if action == "walk":
        if direction in {"left", "right"}:
            offsets = [(-1, 0), (1, 1), (0, 0), (-1, -1)]
        elif direction == "up":
            offsets = [(0, 0), (-1, -1), (0, 0), (1, -1)]
        else:
            offsets = [(0, 0), (-1, 1), (0, 0), (1, 1)]
        return [paste_shifted(base, dx, dy) for dx, dy in offsets]

    if direction == "left":
        offsets = [(5, 0), (-2, 0), (-7, 0), (1, 0)]
    elif direction == "right":
        offsets = [(-5, 0), (2, 0), (7, 0), (-1, 0)]
    elif direction == "up":
        offsets = [(0, 5), (0, -2), (0, -7), (0, 1)]
    else:
        offsets = [(0, -5), (0, 2), (0, 7), (0, -1)]

    frames = [paste_shifted(base, dx, dy) for dx, dy in offsets]
    frames[1] = add_slash(frames[1], direction, 1)
    frames[2] = add_slash(frames[2], direction, 2)
    return frames


def make_preview(sheet: Image.Image) -> None:
    scale = 2
    preview = sheet.resize((sheet.width * scale, sheet.height * scale), Image.Resampling.NEAREST)
    overlay = Image.new("RGBA", preview.size, (22, 24, 30, 255))
    overlay.alpha_composite(preview, (0, 0))
    draw = ImageDraw.Draw(overlay)
    grid = (255, 255, 255, 42)
    for x in range(0, overlay.width + 1, FRAME * scale):
        draw.line((x, 0, x, overlay.height), fill=grid)
    for y in range(0, overlay.height + 1, FRAME * scale):
        draw.line((0, y, overlay.width, y), fill=grid)
    PREVIEW_OUT.parent.mkdir(exist_ok=True)
    overlay.save(PREVIEW_OUT)

    cell_preview = Image.new("RGBA", (COLS * FRAME, ROWS * FRAME), (26, 28, 34, 255))
    cell_preview.alpha_composite(sheet, (0, 0))
    draw = ImageDraw.Draw(cell_preview)
    for row, (action, direction) in enumerate(LABELS):
        draw.text((4, row * FRAME + 4), f"{row:02d} {action} {direction}", fill=(255, 255, 255, 190))
    cell_preview.save(CELLS_OUT)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "source").mkdir(exist_ok=True)
    (OUT_DIR / "base").mkdir(exist_ok=True)

    candidates = recent_generated_images()
    if len(candidates) <= max(SELECTED):
        raise RuntimeError(f"Need at least {max(SELECTED) + 1} generated candidates, found {len(candidates)}.")

    base_rows: list[Image.Image] = []
    for row, candidate_index in enumerate(SELECTED):
        action, direction = LABELS[row]
        source = candidates[candidate_index]
        source_out = OUT_DIR / "source" / f"row{row:02d}_{action}_{direction}.png"
        shutil.copy2(source, source_out)

        cutout = remove_chroma_key(Image.open(source))
        base = trim_and_fit(cutout, row)
        base.save(OUT_DIR / "base" / f"row{row:02d}_{action}_{direction}.png")
        base_rows.append(base)

    sheet = Image.new("RGBA", (COLS * FRAME, ROWS * FRAME), (0, 0, 0, 0))
    for row, base in enumerate(base_rows):
        action, direction = LABELS[row]
        for col, frame in enumerate(animation_frames(base, action, direction)):
            sheet.alpha_composite(frame, (col * FRAME, row * FRAME))

    SPRITE_OUT.parent.mkdir(exist_ok=True)
    sheet.save(SPRITE_OUT)
    sheet.crop((0, 0, FRAME, FRAME)).save(PORTRAIT_OUT)
    make_preview(sheet)

    print(f"wrote {SPRITE_OUT} {sheet.size} {sheet.mode} bbox={sheet.getbbox()}")
    print(f"wrote {PORTRAIT_OUT}")
    print(f"wrote {PREVIEW_OUT}")
    print(f"wrote {CELLS_OUT}")


if __name__ == "__main__":
    main()
