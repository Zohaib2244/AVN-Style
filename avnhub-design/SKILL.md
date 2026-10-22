---
name: avnhub-design
description: AVN Hub page architecture — the canvas (frame bezel), the Hub Core dock (auto-hiding control deck), the slot grid, and widgets; plus the three canvas modes (widgets-on-canvas, whole-page-on-canvas, no canvas). Use when building or restyling any AVN Hub-style page or dashboard shell, or when adding a widget/dock/canvas to another project. Pairs with the nutstyle skill (tokens, type, cards).
---

# AVN Hub design

How an AVN Hub screen is put together. `nutstyle` answers "what does a card look
like"; this skill answers "where does everything go and how does it behave".
Read `styles/nutstyle/SKILL.md` first — every colour, size and shadow here is a nutstyle token.

## The five layers (back to front)

| # | Layer | Element | Owns |
|---|---|---|---|
| 1 | Wallpaper (BG) | `.wallpaper-layer`, `position: fixed`, `z-index: -1` | optional image/video per canvas, parallax |
| 2 | Canvas | `.frame` (+ `.frame-inner` scroller) | the bezel the page sits in |
| 3 | Grid | `.slot-frame` → `.slot-region` | where widgets may go |
| 4 | Widgets | `.capsule` > `.block` | content, per-size layout |
| 5 | Dock | `.hub-core-deck` > `.hub-core-bar` / `.hub-core-stub` / `.hub-core-panel` | controls, floats over the canvas |

Overlays (command palette z 500, dialogs, install cover) sit above everything and
are mounted **outside** `.frame` so its `backdrop-filter` cannot become their
containing block.

## Canvas modes — pick one per canvas

The canvas is a per-canvas choice, not a fixed chrome. Three modes
(`references/canvas-modes.md` has markup, CSS and the persistence shape):

1. **Grid canvas** — the bezel wraps *only the widget grid*. Page chrome (header,
   nav, footer, prose) stays outside on the bare page background. Use when the
   page is mostly a normal site and the dashboard is one section of it.
2. **Page canvas** — the bezel wraps *the entire page*: header, grid, footer, all
   inside one `.frame`. This is AVN Hub's own home screen. Use for app-like,
   single-screen dashboards.
3. **No canvas** — no bezel. Widgets sit straight on the page (or wallpaper).
   Border and sticker shadow are dropped together, never one without the other.

Switching modes only changes what `.frame` wraps and whether it paints. The grid,
dock and widgets are identical in all three.

## Hard rules

- The dock never lives inside the grid and never takes grid space. It is
  absolutely positioned over the canvas, centred on the **canvas**, not the window.
- Dock is either a stub or the whole bar — no squeezed middle state.
- Panels open **upward** out of the dock and are centred on it, so what you are
  changing stays visible.
- Widgets are content + a manifest entry. Never hand-roll `.block`, label chrome,
  polling or persistence inside a widget.
- Widgets pick their layout from a **size preset** (`badge strip column card panel hero`),
  measured in *standard cells* — not from raw S/M/L spans.
- No layout-animation systems on grid items (framer `layout`, dnd-kit
  `animateLayoutChanges`). Dense flow moves every item and loops to
  "Maximum update depth exceeded".
- Hover effects are off in edit mode, on coarse pointers, and while moving/resizing.
- Blur is allowed on **backdrops** (`backdrop-filter`) and never on shadows.
- Single-letter keyboard shortcuts are forbidden (they fire while typing).
  `Ctrl/Cmd+K` is the only global chord.
- Below 1024px the spatial grid is dropped: one column, Centre → Left → Right.

## Read next

| File | Covers |
|---|---|
| `references/canvas-modes.md` | the three modes, backdrop dials, border toggle, wallpaper, per-canvas state |
| `references/dock.md` | Hub Core deck: stub/bar/panel geometry, auto-hide timings, view/edit switch, canvas pills, command palette |
| `references/grid.md` | slot regions, frame ratios, standard cell, size presets, breakpoints, stacked layout, edit-mode handles |
| `references/widgets.md` | widget anatomy, chrome, per-size markup, backdrop override, focus mode, a11y |
| `assets/layout-modes.html` | live, dependency-free demo of all three modes + dock + grid (open in a browser) |

## Source of truth

AVN Hub at `~/avnhub`: `styles/globals.css`, `components/dashboard/SlotDashboard.tsx`,
`HubCorePanel.tsx`, `lib/useDeckAutoHide.ts`, `config/slotLayout.ts`,
`config/sizePresets.ts`, `lib/grid/standardCell.ts`, `lib/wallpaper.ts`,
`lib/canvases.ts`, `docs/WIDGET_SIZE_PRESETS.md`. If this skill and the app
disagree, the app wins — fix the skill.
