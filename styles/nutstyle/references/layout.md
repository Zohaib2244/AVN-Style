# Layout

- One `.frame` bezel holds the app; cards (`.block`) sit inside in a CSS grid.
- Grid in AVN Hub: 6 columns full width, 4 ≤ 1440px, 2 ≤ 1023px, 1 ≤ 640px; row gap uses `minmax(128px, auto)` so content never clips.
- On ≥ 1024px the frame is `height: calc(100vh - 3rem)` with an inner scroller (`padding: 8px` so shadows aren't clipped, thin scrollbar in `--border`).
- Dense, not airy. Card padding 14px 16px. Prefer small gaps (8–16px).
- Left-aligned, dashboard-like. No centered "portfolio" hero layouts.
- Panels and menus open toward the canvas centre and never cover what they change.
