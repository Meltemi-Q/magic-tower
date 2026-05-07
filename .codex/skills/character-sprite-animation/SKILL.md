---
name: "character-sprite-animation"
description: "Generate and integrate transparent character or monster sprite sheets with idle, walk, and attack actions for lightweight web games."
---

# Character Sprite Animation

Use this skill when a game needs reusable character or monster action frames without adding a rendering engine.

## Output Contract

- Produce one transparent sprite sheet per actor.
- Use a stable grid: 4 columns x 3 rows.
- Row order must be `idle`, `walk`, `attack`.
- Each frame should share the same canvas size and character anchor.
- Keep filenames semantic, for example `hero.svg`, `green_slime.svg`, `boss.svg`.

## Generation Pattern

1. Define actor colors, role, and silhouette before drawing frames.
2. Keep the body center around the same x/y anchor in every frame.
3. Vary only a few pose values per frame:
   - idle: breathing, small bob, eye or weapon shimmer
   - walk: alternating leg or body offset
   - attack: weapon swing, lunge, magic burst, claw extension
4. Use transparent backgrounds and SVG or PNG alpha.
5. Store the generator script with the assets so future actors can be regenerated.

## Integration Pattern

Use CSS sprite playback with:

```css
.actor-sprite {
  background-size: 400% 300%;
  background-position: 0 var(--sprite-y);
  animation: spriteCycle 960ms steps(1, end) infinite;
}
```

Set `--sprite-y` to `0%`, `50%`, or `100%` for the three action rows.

## Quality Checks

- Frames must not jump vertically except for intentional bobbing.
- Attack frames should read clearly at tile size.
- Bosses can use larger render scale, but must not overflow the tile.
- Re-run the local game and verify idle, walk, and attack rows all display.
