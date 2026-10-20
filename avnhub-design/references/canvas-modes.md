# Canvas modes

A **canvas** in AVN Hub is two things with the same name:

- the **bezel** — the `.frame` element that visually holds the page, and
- a **named layout profile** (Arc-spaces style: home / work / media) that stores
  its own widget arrangement, theme mode, palette, wallpaper and backdrops.

This file is about the bezel. Profiles are at the bottom.

> Status: the bezel's **border toggle** (`nutmag-canvas-border`, "canvas border" in
> Hub Core → canvas) and the four **backdrop modes** exist in the app today. The
> three-way **canvas mode** below (grid / page / none) is the design spec that
> generalises them; until it ships, "page canvas" is what AVN Hub does and
> "no canvas" is approximated by `canvas border: off` + `canvas backdrop: transparent`.

## The three modes

```
GRID CANVAS                  PAGE CANVAS                  NO CANVAS
┌ page bg ───────────────┐   ┌ page bg ───────────────┐   ┌ page bg ───────────────┐
│ header / nav (bare)    │   │ ╔═ .frame ═══════════╗ │   │ header / nav           │
│ ╔═ .frame ═══════════╗ │   │ ║ header / nav       ║ │   │ ┌──┐ ┌──┐ ┌────┐       │
│ ║ ┌──┐ ┌──┐ ┌────┐   ║ │   │ ║ ┌──┐ ┌──┐ ┌────┐   ║ │   │ └──┘ └──┘ └────┘       │
│ ║ └──┘ └──┘ └────┘   ║ │   │ ║ └──┘ └──┘ └────┘   ║ │   │ footer                 │
│ ╚══════ dock ════════╝ │   │ ║ footer             ║ │   └────────── dock ────────┘
│ footer (bare)          │   │ ╚══════ dock ════════╝ │
└────────────────────────┘   └────────────────────────┘
```

| | Grid canvas | Page canvas | No canvas |
|---|---|---|---|
| `.frame` wraps | the widget grid only | header + grid + footer | nothing (no `.frame`) |
| Page chrome sits | outside, on page bg | inside the bezel | on page bg / wallpaper |
| Bezel paints | yes | yes | no |
| Dock centres on | the grid's frame | the whole frame | the viewport (fixed) |
| Frame height | `auto` | `calc(100vh - 3rem)` ≥1024px, inner scroll | n/a — page scrolls |
| Best for | a site with a dashboard section | single-screen app / AVN Hub home | wallpaper-first, kiosk, embeds |

### Markup

```html
<!-- page canvas -->
<main class="slot-page">
  <div class="frame frame-with-tabs" data-canvas="page">
    <div class="hub-core hub-core-deck">…dock…</div>
    <div class="frame-inner">
      <header>…</header>
      <div class="slot-frame">…regions…</div>
      <footer>…</footer>
    </div>
  </div>
</main>

<!-- grid canvas -->
<main class="slot-page">
  <header>…</header>
  <div class="frame frame-with-tabs" data-canvas="grid">
    <div class="hub-core hub-core-deck">…dock…</div>
    <div class="frame-inner"><div class="slot-frame">…regions…</div></div>
  </div>
  <footer>…</footer>
</main>

<!-- no canvas: same grid, bezel removed -->
<main class="slot-page" data-canvas="none">
  <header>…</header>
  <div class="slot-frame">…regions…</div>
  <div class="hub-core hub-core-deck hub-core-deck--viewport">…dock…</div>
</main>
```

### CSS contract

Set the mode as `data-canvas="grid|page|none"` on `<html>` (pre-paint, same inline
script that already sets `data-theme`, `data-palette`, `data-backdrop`) so there is
no flash. Everything else is selectors on that attribute:

```css
/* none: keep the box so layout and the dock anchor survive, drop the paint.
   Border AND shadow go together — a shadow with no border to cast it reads as
   a stray rectangle (this is the existing data-canvas-border="hidden" rule). */
html[data-canvas="none"] .frame {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  backdrop-filter: none;
  padding: 0;
}

/* grid: the frame hugs the grid, so it must not claim viewport height */
html[data-canvas="grid"] .frame { height: auto; }

/* dock fallback for "none": nothing to be centred on, so pin to the viewport */
.hub-core-deck--viewport { position: fixed; inset: 0; }
```

In `none` mode the dock's hot-zone maths still work — they measure the pill, not
the frame (see `dock.md`).

### Choosing

- Default new canvases to **page canvas**.
- Offer the switch in Hub Core → **canvas**, directly above `canvas backdrop`,
  as a 3-option `.seg-row`: `grid · page · none`.
- It is per canvas, namespaced with `canvasScopedKey("nutmag-canvas-mode", id)` and
  persisted like every other per-canvas key.
- `none` with a **solid** page background is valid but loses the sticker identity;
  in that mode keep widgets on `.block` (they still carry the sticker look) and
  warn nothing — the widgets are the identity.

## Backdrop dials (independent, per canvas)

Two separate dials. The widget one is a *global default every widget inherits* via
"auto"; it does **not** cascade from the canvas one.

| Mode | `.frame` / `.block` background | extra |
|---|---|---|
| `solid` | token (`--bg-page` / `--bg-card`) | default |
| `blur` | token at 55% via `color-mix(... transparent)` | `backdrop-filter: blur(18px)` |
| `transparent` | `transparent` | — |
| `glass` | token at 35% | `blur(26px) saturate(1.7)`; on `.frame` only, an inset top-edge highlight `inset 0 1px 0 color-mix(in srgb, var(--text-primary) 22%, transparent)` |

Attributes: `data-backdrop` and `data-widget-backdrop` on `<html>`; a widget's own
override is `data-backdrop` on its `.block`. Selector `.block:not([data-backdrop])`
is what makes "auto" mean "inherit" with no JS. Glass skips the highlight on
`.block` because `.block:hover` already moves the shadow.

The hard sticker shadow is kept in every mode. Backdrop modes only change
translucency.

## Wallpaper

- Optional per canvas, image or short muted looping video, stored in IndexedDB
  (too big for localStorage). Rendered by one fixed layer behind everything.
- Invisible under `solid` (the opaque `.frame` covers it) — it only shows through
  `blur / transparent / glass` or `no canvas`.
- Parallax is opt-in: max shift 22px, layer scaled 1.08 so panning never reveals an
  edge; updated by direct ref mutation in `mousemove`, never React state.
- A wallpaper unlocks the generated **auto** palette (`data-palette="wallpaper"`),
  solved to the same contrast targets as hand-made packs.

## Canvas profiles (the named layouts)

`{ id, name, icon? }[]` + `activeId` in `nutmag-canvases`. The original canvas is
`default` and uses bare keys; every later canvas suffixes `::<id>`. Per canvas:
slot layout, theme mode, palette, wallpaper, both backdrops, parallax, border
(and canvas mode). New canvases start empty with hard-coded theme defaults — never
a clone. The last canvas cannot be deleted. Switching fades the old widget tree
out (opacity only, 0.24s) then cascades the new one in (centre first, then +45ms
per widget, capped at 10 steps).
