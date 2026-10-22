# Tokens

> Original Nutstyle notes. The current token names are the contract roles in `../tokens.css`; the names below still work as aliases.

14 tokens per palette, each defined for dark and light.

| Token | Role | Ember dark | Ember light |
|---|---|---|---|
| `--bg-page` | page / frame background | `#13100c` | `#d8cfbc` |
| `--bg-card` | card surface | `#1e1a14` | `#f5f0e6` |
| `--bg-nested` | inputs, wells, nested surfaces | `#1a1610` | `#faf6f0` |
| `--border` | all borders | `#3d3220` | `#7a6a52` |
| `--shadow` | hard offset shadow colour | `#070604` | `#a89878` |
| `--text-primary` | headings, values | `#e8dfc8` | `#1c1810` |
| `--text-muted` | content, prose, interactive resting state | `#b5b0a3` | `#514739` |
| `--text-muted-dim` | labels / uppercase headers | `#8b8576` | `#796856` |
| `--accent-orange` | primary accent slot | `#ff6b2b` | `#e05a18` |
| `--accent-cyan` | secondary accent slot | `#00b4c8` | `#00768a` |
| `--accent-warm` | warm neutral (= text-primary) | `#e8dfc8` | `#1c1810` |
| `--badge-text` | text on accent fills | `#13100c` | `#f5f0e6` |
| `--status-up` | healthy | `#1c6b30` | `#1a5e28` |
| `--status-down` | failed / attention | `#c84a12` | `#c84a12` |

## Palettes
`ember` (default), `slate`, `moss`, `plum`, `reef`, `raspberry`, `circuit`, `graphite` — all in `tokens.css`.

## Contrast contract (new palettes must meet it, dark and light)
- `--text-muted` ≈ **8.0:1** against `--bg-card`
- `--text-muted-dim` ≈ **4.7:1** against `--bg-card`
- fixed ~1.70:1 gap between them, so a label never reads as the same tone as the text beneath it

## Rules
- Define the full 14-token set for both modes. Never partial.
- The slot name stays `--accent-orange`/`--accent-cyan` even when the hue is blue or green.
