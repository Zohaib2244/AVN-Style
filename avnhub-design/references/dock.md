# The dock (Hub Core control deck)

One horizontal sticker bar, centred on the bottom of the **canvas**. It replaced a
right-edge tab column. It holds: canvas pills · divider · view|edit switch ·
canvas settings · widget manager · snapshot · `⌘K` key-cap.

## Three parts, one anchor

```
.hub-core.hub-core-deck      transparent, pointer-events:none, inset:0, z-index:100
 ├─ .hub-core-stub           resting state: 3 dots straddling the frame's bottom border
 ├─ .hub-core-bar            open state: the sticker bar
 └─ .hub-core-panel          settings / widget manager, opens UPWARD from the bar
```

The deck layer paints nothing. It exists so the stub, bar and panel can each be
centred independently. Each real control sets `pointer-events: auto`; the layer
itself must never eat clicks meant for widgets. Consequence: an outside-click test
is `closest(".hub-core-bar, .hub-core-panel, .hub-core-stub")`, not
`panel.contains()`.

### Centring

```css
.hub-core-bar { position:absolute; left:0; right:0; bottom:10px;
  width:fit-content; max-width:calc(100% - 16px); margin-inline:auto; }
```

Never `left:50%` + `translateX(-50%)`: for an absolutely positioned box `left:50%`
also halves the width it may lay out in, so the bar wraps at half the room it has,
and the transform is then taken from the collapse animation. Same recipe for
stub and panel.

### Look

| Part | Spec |
|---|---|
| Bar | `--bg-card`, `1.5px solid var(--border)`, radius 14, `4px 4px 0 var(--shadow)`, padding 6, gap 4, **wraps** (never scrolls — scroll would clip the rename flyout) |
| Bar button | 32px tall, radius 8, transparent border; hover / focus-visible / active → `--accent-orange` text + border; active adds 10% orange fill |
| Edit mode | bar and stub border → `--accent-orange`; stays visible with the deck put away |
| Stub | 24px tall, radius 12, `3px 3px 0`, `bottom:-13px` (half its height + the 0.75px midline of the 1.5px border) |
| Stub dots | 5px, **one per canvas**, active one `--accent-cyan`, rest `--text-muted-dim`. They report where you are while the deck is away. |
| Panel | `--bg-card`, `1.5px solid var(--accent-cyan)`, radius 12, `5px 5px 0`, `bottom:56px`, width 250 (settings 400, widgets 280), `max-height: min(58vh, 430px)` |
| Divider | 0×20px, `border-left:1px solid var(--border)`, margin 0 3px |

Collapsed bar: `opacity:0; pointer-events:none; transform: translateY(6px) scale(.9)`.
Open stub does the reverse (`translateY(-12px) scale(.72)`). Never a half-squashed bar.

## Auto-hide (`lib/useDeckAutoHide.ts`)

| Constant | Value | Why |
|---|---|---|
| `DWELL` | 90 ms | a pointer crossing the bottom row must not flap the deck |
| `GRACE` | 500 ms | leaving the deck is usually on the way back to it |
| `STUB_REACH` | 28 px | collapsed hot zone = a margin round the pill, not a strip of screen |
| `BAR_REACH` | 18 px | open hot zone = the bar's own box + 18, so the pointer can travel it |
| `PEEK` | 1400 ms | a canvas change made from outside (e.g. palette) shows the deck briefly |

```ts
open = pinned || hoverOpen || focusOpen   // OR-ed, never pushed into state
```

- **Pinned** by: an open tab/panel, edit mode, any live popover. A deck can never
  collapse mid-task and no effect is needed to re-open it.
- **Focus** pins only on `:focus-visible`. Plain `focus` fires on click and would
  pin the deck open for good after any click inside it.
- **Escape** dismisses at once (the one case that skips the grace).
- **Coarse pointers**: skip proximity entirely. The stub is a plain tap target.
- It is a real `<button>`. Hover is the accelerator, not the only way in.
- The hot zone was once the frame's full width over its bottom 92px; that opened
  the deck whenever you read the bottom row of widgets. Do not go back.

## View | edit switch

One control, both states spelled out (`.deck-switch`, `--switch-half: 58px`). The
old wrench-then-padlock tab showed the state you were *not* in. Edit mode is
controlled here and from the command palette — never duplicated inside panels.

Edit mode reveals per-widget: drag handle, gear, remove ×, resize handles, empty-cell
"+" targets, and frame-ratio handles on Central Base's W/E/S edges.

## Canvas pills

- Icon (curated Lucide set, falls back to the name's first letter) + name side by side.
- Name clamps with `max-width: 96px` + ellipsis.
- Double-click → rename / delete flyout (`.canvas-manage-panel`), opens **upward**.
  Same mutators also drive the "canvases" section in settings.
- `.canvas-pill-list` has **no** `overflow:hidden` — it would clip that flyout.

## Settings panel

A **section rail**, not an accordion: left rail, one body on the right.

`theme · canvas · widget style · layout · canvases · system`

- `theme`: mode (light/dark/auto) + palette.
- `canvas`: wallpaper, parallax, canvas backdrop, canvas border / canvas mode.
- `widget style`: the global widget backdrop default. Separate from `canvas`
  *because it does not cascade from it*.
- `layout`: region grid sizes, import/export, reset (next to the layout it throws out).
- Selected section lives in `LayoutProvider`, so the palette can open straight to one.
- Height tweens via a `ResizeObserver` on `.hub-settings-scroll` and animating
  `height` — **not** framer's `layout` prop (its scale transform squashes text).
  Measure the scroller, not the raw content; the cap and the scroll live on
  `.hub-settings-scroll`.
- Below 640px the rail becomes a wrapping chip row above the body.

## Command palette

`Ctrl/Cmd+K` anywhere, or the key-cap at the end of the dock. z-index 500: above
deck and panels, below the install cover and dialogs. Mounted outside `.frame`.

- Commands rebuilt from live state each render: every canvas, `new canvas…`, edit
  mode, widget manager, snapshot, each settings section, three theme modes, every
  palette, layout export, layout reset.
- Matching: order-free whole-word substring over group + label + keywords. Never fuzzy.
- Destructive commands (reset) go through a `.hub-dialog` confirm.
- First Escape clears a typed query, second closes. The deck's Escape handlers stand
  down while it is open — one Escape closes one thing.
- Does **not** take the chord inside the NutBot shell (`.term-xterm`, Ctrl+K is
  readline kill-line), while a dialog is up, or during a widget install.

## Rejected alternatives

`chin` and `float` docking were prototyped in `public/proto/control-deck.html` and
rejected in favour of the auto-hiding stub. The right-edge tab column they replaced
hung outside the frame; the deck never leaves the frame's box.
