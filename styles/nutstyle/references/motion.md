# Motion

Subtle. Data transitions and state changes only.

- Colour/border transitions: **0.15s ease** (controls), 0.2–0.3s (cards, theme).
- Card hover: border → accent and shadow 3px → 5px over 0.25s.
- Entrances: opacity + small transform, 0.18–0.24s, `cubic-bezier(0.33, 1, 0.68, 1)`.
- Busy indicator: `installing-pulse` (opacity 0.25↔1, scale 0.75↔1.15).
- **No** scanlines, grain, phosphor glow, neon, parallax by default.
- Respect `prefers-reduced-motion`: drop transforms, keep colour changes.
- Do not attach layout-animation systems (framer-motion `layout`) to dense grids — they loop.
