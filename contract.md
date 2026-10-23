# Style contract

Every style fills these roles. The UX (`ux/`) and its `components.css` use **only**
these names, so any style that provides all of them works with every page pattern.

Define colours with `light-dark(light, dark)` so one declaration covers both themes,
and switch themes with `color-scheme` on `<html>`:

```css
:root { color-scheme: dark; }
@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { color-scheme: light; } }
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark; }
```

Palettes are `:root[data-palette="name"] { … }` blocks that re-fill the colour roles.
No `data-palette` attribute means the style's default palette.

## Surfaces and text

| Role | Used for |
|---|---|
| `--bg` | page background |
| `--panel` | cards, panels, sidebar, drawers, popovers |
| `--nested` | inputs, wells, things inside a panel |
| `--raise` | hover and selected backgrounds, empty bar tracks |
| `--line` | every border and divider |
| `--line-strong` | stronger borders: inputs, popovers, chart outlines |
| `--text` | headings, values, primary text |
| `--muted` | body text, resting controls |
| `--dim` | labels, captions, axis text |
| `--dot` | the background dot pattern (may be `transparent`) |

Contrast: `--muted` on `--panel` ≥ 7:1, `--dim` on `--panel` ≥ 4.5:1, in both themes.

## Accent

| Role | Used for |
|---|---|
| `--accent` | the one main action, the active nav item, the highlighted data point |
| `--accent-ink` | text and icons on an `--accent` fill |
| `--accent-soft` | tinted backgrounds (chips, selected options) |
| `--accent-text` | accent-coloured small text, readable on `--panel` |
| `--bar` | chart bars that aren't highlighted |

## Status

Status colours mean state only, never decoration, and are separate from the accent.

| Role | Kind | Means |
|---|---|---|
| `--ok` | Verified | confirmed by a check or real data |
| `--done` | Done | finished, not confirmed yet |
| `--info` | Info | neutral news, something running |
| `--new` | New | new or experimental |
| `--warn` | Warning | might be wrong; needs a look |
| `--bad` | Failed | broken or blocking |

Each also has a `-soft` background (`--ok-soft` … `--bad-soft`), usually
`color-mix(in srgb, var(--ok) 13%, var(--panel))`.

## Highlight colours

`--hl-orange --hl-cyan --hl-green --hl-pink --hl-violet --hl-gold`: the six colours a
person can give a highlight rule. The names are slots; a style may change the hues.

## Type

| Role | Used for |
|---|---|
| `--font-px` | display: page titles, key numbers, drawer titles |
| `--font-ui` | body text, controls |
| `--font-mono` | data, IDs, event names, code |
| `--font-label` | uppercase labels and table headers |
| `--font-btn` | button text |
| `--tt-btn`, `--ls-btn` | button text-transform and letter-spacing |
| `--w-display` | weight for the display font |
| `--num` | colour of key numbers (often `var(--text)`) |

Never system UI defaults for display; every font needs a real fallback stack.

## Shape and motion

| Role | Used for |
|---|---|
| `--r-card`, `--r-ctl` | corner radius of cards / of controls |
| `--bw` | border width |
| `--shadow-c` | offset-shadow colour (or `transparent`) |
| `--lift`, `--lift-btn` | box-shadow of cards / buttons (`none` allowed) |
| `--ease` | the main easing curve |

## Rules

- A style fills **every** role, in both themes. Never partial.
- Components never use a raw colour, font family or radius. If a component needs a
  value that isn't here, add a role to this file first.
- Optional extras live in the style's `skin.css` (component looks: shadows, label
  case, hover lifts) and `flavour.css` (art, scenes, icons). The UX must work without
  either.
