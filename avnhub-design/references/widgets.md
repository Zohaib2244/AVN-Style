# Widgets

A widget = **one content component + one manifest entry**. The framework supplies
the card, header, placement, polling, settings UI and persistence.

## DOM shape

```html
<div class="capsule" id="<widget-id>" data-size="M" data-preset="card"
     data-kb-widget="<widget-id>">           <!-- container-type:inline-size; container-name:widget -->
  <div class="block [accent-left]" [data-backdrop]>
    <div class="block-label">label</div>      <!-- shell-owned header -->
    …widget content…
  </div>
</div>
```

- `.capsule` is a **named container** — use `@container widget (max-width: …)` for
  width-dependent layout, never viewport media queries.
- `.capsule > .block` is `flex: 1 1 auto; min-height: 0` so the card fills its cell.
- Flags: `plainChrome` (no card — identity), `customHeader` (own header — github,
  steam), `accent` (3px orange left border), `className`.

## Card treatment

Straight from nutstyle: radius 12, `1.5px solid var(--border)`, `3px 3px 0
var(--shadow)`, padding `14px 16px`. Hover → accent border + 5px shadow. Keyboard
focus (`data-kb-focus`) → border mixed 70% orange + 5px shadow.

## Per-size UI — the main lever

Either:
1. branch on `useWidget().size` / preset inside the component (full control), or
2. declare a `detail` component, auto-rendered below the content at `L`/panel size.

A widget with large-only content **must** include that size/preset in its manifest.
Show *more* when bigger by rendering *different markup*, not by scaling.

Compact widgets must survive narrow cells: control rows wrap or stack. A pinned
size in too small a cell crops — content must clip cleanly, never spill.

## Do not

- hand-roll `.block`, `.capsule`, label chrome
- write your own polling loop (use `usePolling`: shared per-URL cache + timer,
  honours the global polling pref, never commits non-OK responses)
- persist your own layout state
- put API keys client-side; all external calls go through `/app/api/*`
- add `.block` hover tricks that reflow neighbours

## Settings

Declared as a schema in the manifest (`toggle | select | text | number`, masked
`password` for secrets). The gear popover renders it. Framework settings every
widget gets: `layoutSize` (auto/S/M/L), `hoverExpand`, `cardBackdrop` (auto or a
mode — overrides the global widget backdrop for that card only).

## Edit-mode chrome (shell-owned)

Dashed outline on `.editing`; drag handle, gear (`.slot-settings-btn`), remove
(`.slot-remove-btn`), resize handles, a `.block-hover-tag` title chip, and a
`.slot-preset-tag`. All are hidden at rest and revealed by `.slot-cell:hover` or
`.editing`.

## Errors

`WidgetErrorBoundary` isolates a crashing widget: it renders a `.block-label` in
`--status-down` with the message, and clears itself when the widget is resized,
reconfigured or hot-reloaded (`resetKey`). One broken widget never takes the
canvas down.

## Accessibility

- Visible `:focus-visible` ring on every interactive element; state is never colour
  alone (see nutstyle `references/states.md`).
- Keyboard focus on a widget is tracked (`data-kb-focus`); clicking bare canvas
  clears it.
- Everything non-interactive during an install is `inert`, not just
  `pointer-events:none`.
- Run `scripts/contrast-audit.py` after any token change; widgets inherit the
  8.0:1 / 4.7:1 text-role targets from nutstyle.

## Canvas-only extras

Widgets rendering `<canvas>` / animation must pause when hidden, respect
`prefers-reduced-motion`, and read colours from CSS variables at draw time so a
palette or mode switch re-colours them.
