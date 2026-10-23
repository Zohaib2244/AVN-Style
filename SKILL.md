---
name: avn-design
description: Entry point for designing or changing UI in Zohaib's web projects (AVN Analytics, AVN PlayLens and any new dashboard or tool site). Use before writing any UI, CSS, HTML or page layout. Routes to the UX rules (ux/) and the project's chosen style (styles/<name>/).
---

# AVN design

Two layers, always used together:

1. **UX** — `ux/SKILL.md`. How the tool works: page patterns, components, behaviour,
   words, loading/errors/toasts, NutBot. The same for every style. Covers dashboards
   and tool sites; its *Foundations* also apply to any web app.
2. **Style** — `styles/<name>/SKILL.md`. How it looks: colours, fonts, shape, icons,
   flavour. Swappable.

The **contract** (`contract.md`) is the list of roles a style fills and the UX uses.

## Use it

1. Find the project's line in its `AGENTS.md` / `CLAUDE.md`, e.g.
   `Design: avn-design · UX: avn-ux · Style: avn-family`. No line? Ask which style.
2. Read `ux/SKILL.md`, then the style's `SKILL.md`.
3. Build with `ux/assets/components.css` + the style's `tokens.css` (and its optional
   `skin.css` / `flavour.css`).
4. Before saying you're done, run the self-check in `ux/references/process.md`.

## Styles here

| Style | Look | Folder |
|---|---|---|
| AVN Family | calm warm dark, Pixelify titles, pixel icons, personal flavour | `styles/avn-family/` |
| Nutstyle | AVN Hub's chunky sticker cards, DotGothic, offset shadows | `styles/nutstyle/` |
| Pocket | a handheld console in cream: cream shell / olive LCD, Space Grotesk + Inter + JetBrains Mono, keys that press, four shell palettes | `styles/pocket/` |
| New style | copy the template | `styles/_template/` |

AVN Hub's own screen architecture is separate: `avnhub-design/` (uses Nutstyle).

`board/index.html` is the live style board: every pattern working, both styles,
every palette, three widths. Open it in a browser.
