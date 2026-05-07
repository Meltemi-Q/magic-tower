---
name: "game-ui-components"
description: "Build compact, readable game UI panels and icon controls for browser-based grid games."
---

# Game UI Components

Use this skill for browser games that need a dense play screen rather than a landing page.

## Layout Rules

- Put the playable board in the first viewport.
- Keep status, target preview, save slots, and logs visible or close by.
- Use fixed grid dimensions for boards and control pads to prevent layout shift.
- Use icons for directional controls, save/load, restart, help, and close actions.
- Keep card radius at 8px or less.

## Control Rules

- Direction buttons should use arrow or chevron icons, not plain text arrows.
- Every icon-only button needs an `aria-label`.
- Action buttons can use icon plus short text.
- Use `:focus-visible` states for keyboard players.

## Panel Rules

- Use grouped rows for stats and keys.
- Use tabular numerals for frequently changing values.
- Keep target preview rows consistent: label on the left, value on the right.
- Logs should use compact line height and fixed height with scroll.

## Quality Checks

- Test at desktop width and around 360px mobile width.
- Button text must not wrap awkwardly or overflow.
- Map tiles, controls, and panels must not overlap.
