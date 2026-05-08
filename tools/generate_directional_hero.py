from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


LOGICAL_FRAME = 96
FRAME = 128
COLUMNS = 4
FACINGS = ("down", "left", "right", "up")
ACTIONS = ("idle", "walk", "attack")
ROWS = tuple((action, facing) for action in ACTIONS for facing in FACINGS)
SHEET_SIZE = (FRAME * COLUMNS, FRAME * len(ROWS))
SHEET_OUT = Path("assets/sprites/hero.png")
ICON_OUT = Path("assets/hero.png")
PREVIEW_OUT = Path("tmp/hero-cells-preview.png")

COLORS = {
    "outline": (18, 17, 15, 255),
    "shadow": (0, 0, 0, 82),
    "skin": (241, 190, 132, 255),
    "hair": (100, 63, 34, 255),
    "helm": (222, 225, 214, 255),
    "helm_dark": (128, 135, 126, 255),
    "blue": (42, 92, 172, 255),
    "blue_dark": (21, 48, 103, 255),
    "gold": (232, 189, 76, 255),
    "steel": (224, 229, 232, 255),
    "steel_dark": (101, 112, 116, 255),
    "shield": (42, 104, 181, 255),
    "shield_hi": (111, 226, 210, 255),
    "white": (244, 241, 232, 255),
}


def main() -> None:
    sheet = build_sheet()
    SHEET_OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(SHEET_OUT)

    icon = sheet.crop((0, 0, FRAME, FRAME))
    icon.save(ICON_OUT)

    PREVIEW_OUT.parent.mkdir(parents=True, exist_ok=True)
    build_preview(sheet).save(PREVIEW_OUT)


def build_sheet() -> Image.Image:
    sheet = Image.new("RGBA", SHEET_SIZE, (0, 0, 0, 0))
    for row, (action, facing) in enumerate(ROWS):
        for frame_index in range(COLUMNS):
            frame = draw_frame(action, facing, frame_index)
            sheet.alpha_composite(frame, (frame_index * FRAME, row * FRAME))
    return sheet


def build_preview(sheet: Image.Image) -> Image.Image:
    label_w = 92
    label_h = 28
    width = label_w + sheet.width
    height = label_h + sheet.height
    preview = Image.new("RGBA", (width, height), (12, 13, 11, 255))
    draw = ImageDraw.Draw(preview)

    draw.rectangle((label_w, label_h, width - 1, height - 1), fill=(22, 23, 20, 255))
    for y in range(label_h, height, 16):
        for x in range(label_w, width, 16):
            if ((x - label_w) // 16 + (y - label_h) // 16) % 2 == 0:
                draw.rectangle((x, y, min(x + 15, width - 1), min(y + 15, height - 1)), fill=(32, 34, 30, 255))

    preview.alpha_composite(sheet, (label_w, label_h))

    for col in range(COLUMNS):
        x = label_w + col * FRAME
        draw.text((x + 8, 8), f"frame {col}", fill=(244, 241, 232, 255))
        draw.line((x, label_h, x, height), fill=(232, 189, 76, 255), width=1)
    draw.line((width - 1, label_h, width - 1, height), fill=(232, 189, 76, 255), width=1)

    for row, (action, facing) in enumerate(ROWS):
        y = label_h + row * FRAME
        draw.text((8, y + 9), f"{row:02d} {action}", fill=(244, 241, 232, 255))
        draw.text((8, y + 25), facing, fill=(170, 169, 153, 255))
        draw.line((label_w, y, width, y), fill=(53, 199, 178, 255), width=1)
    draw.line((label_w, height - 1, width, height - 1), fill=(53, 199, 178, 255), width=1)

    return preview


def draw_frame(action: str, facing: str, frame: int) -> Image.Image:
    img = Image.new("RGBA", (LOGICAL_FRAME, LOGICAL_FRAME), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    bob = [0, -1, 0, 1][frame] if action in {"idle", "walk"} else 0
    step = [-2, 1, 2, -1][frame] if action == "walk" else 0
    attack = frame if action == "attack" else -1
    cx = 48 + (2 if facing == "right" and action == "attack" else -2 if facing == "left" and action == "attack" else 0)
    cy = 45 + bob

    draw.ellipse((cx - 16, cy + 16, cx + 16, cy + 25), fill=COLORS["shadow"])
    draw_body(draw, cx, cy, facing, step)
    draw_head(draw, cx, cy, facing)
    draw_shield(draw, cx, cy, facing, attack)
    draw_sword(draw, cx, cy, facing, attack)
    return img.resize((FRAME, FRAME), Image.Resampling.NEAREST)


def rect(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], color: str) -> None:
    draw.rectangle(xy, fill=COLORS[color])


def draw_body(draw: ImageDraw.ImageDraw, cx: int, cy: int, facing: str, step: int) -> None:
    rect(draw, (cx - 10, cy - 8, cx + 10, cy + 12), "outline")
    rect(draw, (cx - 8, cy - 7, cx + 8, cy + 10), "blue")
    rect(draw, (cx - 7, cy - 7, cx + 7, cy - 3), "gold")
    rect(draw, (cx - 3, cy - 4, cx + 3, cy + 12), "blue_dark")

    if facing == "up":
        rect(draw, (cx - 8, cy - 7, cx + 8, cy - 1), "blue_dark")
        rect(draw, (cx - 6, cy - 6, cx + 6, cy - 3), "gold")

    left_leg = step if step < 0 else 0
    right_leg = step if step > 0 else 0
    rect(draw, (cx - 9 + left_leg, cy + 10, cx - 3 + left_leg, cy + 24), "outline")
    rect(draw, (cx - 8 + left_leg, cy + 11, cx - 4 + left_leg, cy + 21), "blue_dark")
    rect(draw, (cx + 3 + right_leg, cy + 10, cx + 9 + right_leg, cy + 24), "outline")
    rect(draw, (cx + 4 + right_leg, cy + 11, cx + 8 + right_leg, cy + 21), "blue_dark")
    rect(draw, (cx - 11 + left_leg, cy + 22, cx - 3 + left_leg, cy + 26), "outline")
    rect(draw, (cx + 3 + right_leg, cy + 22, cx + 11 + right_leg, cy + 26), "outline")


def draw_head(draw: ImageDraw.ImageDraw, cx: int, cy: int, facing: str) -> None:
    rect(draw, (cx - 11, cy - 24, cx + 11, cy - 7), "outline")
    rect(draw, (cx - 9, cy - 22, cx + 9, cy - 8), "helm")
    rect(draw, (cx - 8, cy - 16, cx + 8, cy - 8), "skin")
    rect(draw, (cx - 8, cy - 22, cx + 8, cy - 18), "hair")
    rect(draw, (cx - 3, cy - 27, cx + 3, cy - 23), "steel")
    rect(draw, (cx - 13, cy - 19, cx - 10, cy - 13), "helm_dark")
    rect(draw, (cx + 10, cy - 19, cx + 13, cy - 13), "helm_dark")

    if facing == "down":
        rect(draw, (cx - 5, cy - 14, cx - 3, cy - 12), "outline")
        rect(draw, (cx + 3, cy - 14, cx + 5, cy - 12), "outline")
        rect(draw, (cx - 3, cy - 9, cx + 3, cy - 8), "outline")
    elif facing == "left":
        rect(draw, (cx - 8, cy - 14, cx - 6, cy - 12), "outline")
        rect(draw, (cx - 11, cy - 10, cx - 8, cy - 8), "skin")
    elif facing == "right":
        rect(draw, (cx + 6, cy - 14, cx + 8, cy - 12), "outline")
        rect(draw, (cx + 8, cy - 10, cx + 11, cy - 8), "skin")
    else:
        rect(draw, (cx - 8, cy - 16, cx + 8, cy - 8), "hair")
        rect(draw, (cx - 6, cy - 22, cx + 6, cy - 18), "helm_dark")


def draw_shield(draw: ImageDraw.ImageDraw, cx: int, cy: int, facing: str, attack: int) -> None:
    if facing == "up":
        sx, sy = cx + 9, cy - 3
    elif facing == "left":
        sx, sy = cx + 10, cy - 2
    elif facing == "right":
        sx, sy = cx - 10, cy - 2
    else:
        sx, sy = cx + 11, cy - 1
    if attack >= 2 and facing in {"left", "right"}:
        sy += 1
    draw.ellipse((sx - 7, sy - 8, sx + 7, sy + 10), fill=COLORS["outline"])
    draw.ellipse((sx - 5, sy - 6, sx + 5, sy + 8), fill=COLORS["shield"])
    rect(draw, (sx - 2, sy - 4, sx + 2, sy + 5), "shield_hi")


def draw_sword(draw: ImageDraw.ImageDraw, cx: int, cy: int, facing: str, attack: int) -> None:
    reach = 8 if attack < 0 else [4, 9, 14, 10][attack]
    if facing == "left":
        rect(draw, (cx - 14 - reach, cy - 5, cx - 10, cy - 2), "steel")
        rect(draw, (cx - 12, cy - 6, cx - 8, cy + 2), "gold")
        rect(draw, (cx - 28 - reach, cy - 4, cx - 14 - reach, cy - 3), "white")
    elif facing == "right":
        rect(draw, (cx + 10, cy - 5, cx + 14 + reach, cy - 2), "steel")
        rect(draw, (cx + 8, cy - 6, cx + 12, cy + 2), "gold")
        rect(draw, (cx + 14 + reach, cy - 4, cx + 28 + reach, cy - 3), "white")
    elif facing == "up":
        rect(draw, (cx - 13, cy - 14 - reach, cx - 10, cy - 4), "steel")
        rect(draw, (cx - 15, cy - 5, cx - 8, cy - 1), "gold")
        rect(draw, (cx - 12, cy - 28 - reach, cx - 11, cy - 14 - reach), "white")
    else:
        rect(draw, (cx - 15, cy + 1, cx - 12, cy + 12 + reach), "steel")
        rect(draw, (cx - 17, cy - 1, cx - 10, cy + 3), "gold")
        rect(draw, (cx - 14, cy + 12 + reach, cx - 13, cy + 24 + reach), "white")


if __name__ == "__main__":
    main()
