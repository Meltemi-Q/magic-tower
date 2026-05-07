---
name: "css-js-animation-system"
description: "Implement a small CSS/JS animation state system for grid games using sprite rows, action durations, and render-safe timers."
---

# CSS JS Animation System

Use this skill when a simple DOM game needs action animations without canvas or a game engine.

## State Model

Keep animation state separate from save data:

```js
{
  heroAction: "idle",
  heroFacing: "down"
}
```

Store only current visual state and reset timers. Do not persist timers in saves.

## Playback Model

1. Render actors as positioned elements over the tile base.
2. Set `background-image` to the sprite sheet.
3. Set `--sprite-y` based on action row.
4. Use a CSS keyframe to step through the 4 columns.
5. On movement or combat, set an action and schedule reset to `idle`.

## JS Pattern

```js
setHeroAction(animation, "attack", direction);
window.setTimeout(() => {
  resetHeroAction(animation);
  renderMap();
}, getActionDuration("attack"));
```

Clear any previous timer before starting a new action.

## Quality Checks

- Movement and attack should not block game logic.
- Re-rendering must not create duplicate timers.
- Save/load should reset visual state to idle.
- Sprite elements must be `aria-hidden`; the tile owns the accessible label.
