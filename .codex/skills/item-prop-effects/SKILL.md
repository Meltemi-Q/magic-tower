---
name: "item-prop-effects"
description: "Design animated items and props for grid-based web games using lightweight CSS effects and transparent assets."
---

# Item And Prop Effects

Use this skill when items, keys, potions, doors, stairs, or props need motion without full sprite sheets.

## Visual Rules

- Keep the base item readable at the smallest tile size.
- Prefer transparent PNG or SVG.
- Use subtle motion for collectible items:
  - potions: float and glow
  - gems: float, shimmer, and rotate slightly
  - keys: float and metallic glint
  - stairs: low pulse or highlight when unlocked
- Do not animate every property at once; one positional motion plus one light effect is enough.

## CSS Pattern

```css
.item-entity {
  animation:
    itemFloat 1.8s ease-in-out infinite,
    itemGlow 2.4s ease-in-out infinite;
}
```

Use separate classes for high-value objects when a distinct motion helps scanning.

## Interaction Feedback

- On pickup, log the reward immediately.
- Remove the item entity before the next render.
- Keep reward text short and numeric, for example `HP +120`.

## Quality Checks

- Items must never obscure the player sprite.
- Animations should not shift the grid layout.
- Motion should remain visible on mobile tile sizes.
