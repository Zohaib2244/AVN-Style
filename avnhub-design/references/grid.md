# The grid

Two grid systems exist in AVN Hub. **Slot Layout** is the current, preferred one.
Graph Layout (flat CSS grid + dnd-kit reorder) is legacy; do not break it, do not
extend it.

## Slot Layout

Four regions inside `.slot-frame`:

```
┌────────┬─────────────────┬────────┐
│        │ Central Base    │        │   .slot-center  rows 7fr / 3fr
│  left  │ (region:center) │ right  │
│  2×8   ├─────────────────┤  2×8   │
│        │ base 3×2        │        │
└────────┴─────────────────┴────────┘
   2fr           3fr           2fr        .slot-frame columns, gap 12px
```

| Region | Default dims | Notes |
|---|---|---|
| `left`, `right` | 2 cols × 8 rows | side columns |
| `base` | 3 × 2 | under Central Base |
| `center` | 1 × 1 | **one undivided cell** by default; raise dims to subdivide like any region |

Bounds on user-editable dims: 1–6 columns, 1–12 rows.

Widgets occupy an explicit **cell rectangle** (`gridColumn` / `gridRow` come from the
persisted rect) inside one region. Placement is manual, not auto-flow.

### Frame ratios

Macro proportions are integer `fr` units: `columns [2,3,2]`, `centerRows [7,3]`,
minimum 1 each. Drag handles on Central Base's W / E / S edges (edit mode only)
move space between neighbours, sum constant. Preview is local state; commit on
pointer-up (same pattern as per-widget resize). Ratios resize **regions**, never
the standard cell.

### Frame behaviour

- ≥1024px: `.frame { height: calc(100vh - 3rem) }`, `.frame-inner` is the scroller
  with `padding: 8px` (room for sticker shadows and edit-mode overhangs —
  `.slot-remove-btn` at `top:-7px`, `.resize-handle` at `-4px`), thin scrollbar in
  `--border`. The page itself never scrolls.
- Cells are fixed-height. Overflowing content scrolls **inside the card**
  (`.slot-cell .block { overflow-y:auto }`), scrollbar hidden until hover.
- `.slot-page`: `max-width: 1800px`, `px-5 py-6`.
- Gap everywhere is 12px.

## Standard cell (the unit)

A **standard cell (SC)** is the box a side-column cell has at the default 2×8 grid
and default frame ratios, on the current screen. Computed live from the measured
`.slot-frame`; depends on the viewport only.

```ts
const defaultLeftW = (frameW - 2 * GAP) * (2 / 7);
const pitchX = (defaultLeftW + GAP) / 2;
const pitchY = (frameH + GAP) / 8;
const sc = { width: pitchX - GAP, height: pitchY - GAP };   // 235×112 at 1920×1080
```

Why: changing a region's grid (2×8 → 4×9) or dragging a ratio must not change how
big a "card" looks. Widgets keep their *visible* size, not their span count. Bigger
screen → bigger widgets, same proportions (the Hub fills one screen; it doesn't
scroll in more empty grid).

## Size presets (`config/sizePresets.ts`)

| Preset | Min SC | Max SC | Floor px | For |
|---|---|---|---|---|
| `badge` | 1×1 | 2×1 | 140×56 | one number or status |
| `strip` | 2×1 | 4×1 | 280×56 | wide one-row band: status lights, ticker, links |
| `column` | 1×2 | 1×4 | 70×120 | narrow vertical list |
| `card` | 2×2 | 3×4 | 300×130 | standard data card |
| `panel` | 2×4 | 3×8 | 300×260 | charts, logs, detail |
| `hero` | — | — | — | whole region: terminal, Central Base |

- A widget declares one or more presets; each is **one layout** designed for a
  range. Resizing is free *inside* the range and snaps to allowed footprints.
- The pixel **floor** only bites on small screens, where an SC itself shrinks.
- Fill mode: `reflow` (text may grow up to the `scale` cap, rest = more content) or
  `scale` (render at the min box and scale the whole thing).
- Text scale bounds `0.9–1.25` (hero up to `1.4`), relative to the preset's tokens,
  so all widgets of one preset share text size and spacing.
- Legacy S/M/L still works: S → badge + column, M → card, L → panel + hero.
  `useWidget().size/.orientation` report the legacy equivalent.
- Mixing is deliberate: a wide `strip` and a `card` are different layouts, not one
  layout stretched.

When designing a widget, ask for the **preset box in pixels**, not "an S layout".
Build for the preset's min box; it must survive up to its max.

## Responsive

| Width | Behaviour |
|---|---|
| ≥1024 | spatial 3-column slot frame |
| ≤1023 | `.slot-frame` becomes a flex column: **Center → Left → Right**; every region is a 1-col grid; every cell ignores its rect (`grid-column: 1 / -1 !important`) and takes a full-width, content-height row; resize handles and empty-cell targets are hidden; the page gutter drops to 12px |
| ≤640 (Graph) | 1 column |

Graph Layout columns, for reference: 6 → 4 (≤1440) → 2 (≤1023) → 1 (≤640), rows
`minmax(128px, auto)`, `grid-auto-flow: row dense`.

In the stacked layout, the preset is still computed from a `REFERENCE_FRAME`
(1708×980, i.e. a 1920×1080 viewport) but S/M/L keep the old pixel rule — full-width
rows suit wider layouts.

## Hover On Expand (HOE)

Opt-in per widget (`hoverExpand`, default false). A **transient** preview: the
hovered widget gets a real larger box; only directly edge-touching neighbours get
smaller boxes. Not persisted, no overlay, no cascade to neighbours-of-neighbours.

Guardrails (a previous system removed for a hover-oscillation loop):
- pure grid maths (`lib/grid/hoverExpand.ts`), real preview dimensions
- no framer `layout`, no dnd-kit layout animation
- no state set from hover/measurement callbacks that themselves reflow
- disabled in edit mode, on touch/coarse pointers, and while resizing or moving

## Focus mode

A focused widget lifts out of its cell and grows over the canvas; every other
widget stays put and dims behind `.slot-focus-backdrop` (z-index 40, click to
collapse). Other regions get `inert`. The frame is **not** re-proportioned.

## Entrance cascade

Opacity-only exit on the frame (0.24s). Entrance: Central Base first at `0.15s`,
then each widget at `0.15 + n × 0.045s`, `n` capped at 10. Mount scale
`0.92 → 1` over 0.3s. No `layout` prop, no measuring.

## Reduced motion / touch

`@media (hover:none), (pointer:coarse), (prefers-reduced-motion:reduce)` turns the
hover growth and slot tweens off.
