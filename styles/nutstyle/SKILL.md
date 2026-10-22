---
name: nutstyle
description: Nutstyle — AVN Hub's original look ("Chunky Blocks + Accent Border"): DotGothic16 labels and numbers, JetBrains Mono content, sticker cards with hard offset shadows, 8 palettes × dark + light. Converted to the AVN style contract, so it works with ../../ux/. Use when a project says "Style: nutstyle", and for AVN Hub.
---

# Nutstyle

The AVN Hub look, now a style like any other: it fills every role in
`../../contract.md`, so the AVN UX components work with it unchanged. The old token
names are kept as aliases so AVN Hub keeps working.

## Files
| File | What |
|---|---|
| `fonts.css` | DotGothic16 + JetBrains Mono (non-Next projects) |
| `tokens.css` | contract roles for 8 palettes, dark + light, plus the old names (`--bg-card`, `--border`, `--accent-orange` …) as aliases |
| `skin.css` | the sticker look on AVN UX components: offset shadows, uppercase pixel labels and buttons, accent border on hover |
| `hub-base.css` | AVN Hub's own classes (`.frame`, `.block`, `.seg-btn`, `.hub-dialog` …) for Hub and Hub-style widgets |
| `preview.html` | the Hub classes in a page |
| `references/` | the original Nutstyle notes (tokens, typography, components, motion, layout, porting) |

## Look
- DotGothic16 for labels (uppercase, spaced), headline numbers, titles and buttons; JetBrains Mono for content. Root 17 px with the five-step `--fs-*` scale.
- Cards: 1.5 px border, 12 px radius, **hard offset shadow, never blurred**; hover → accent border + bigger shadow; buttons press down 2 px.
- Key numbers in the secondary accent (cyan in Ember).
- Palettes (`<html data-palette>`): none = ember, `slate`, `moss`, `plum`, `reef`, `raspberry`, `circuit`, `graphite`. Themes with `data-theme`.
- Never: Inter/Roboto/system fonts, blurred shadows, neon glow, scanlines.

## Mapping from the old names
`--bg-page→--bg` · `--bg-card→--panel` · `--bg-nested→--nested` · `--border→--line` ·
`--shadow→--shadow-c` · `--text-primary→--text` · `--text-muted→--muted` ·
`--text-muted-dim→--dim` · `--accent-orange→--accent` · `--accent-cyan→--num` and
`--hl-cyan` · `--badge-text→--accent-ink` · `--status-up/down` feed `--ok` / `--bad`.
Roles the old set didn't have (`--raise`, `--line-strong`, `--done`, `--info`,
`--new`, `--warn`) are derived or set to shared defaults.
