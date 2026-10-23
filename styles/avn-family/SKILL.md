---
name: avn-family-style
description: AVN Family — the default look for Zohaib's AVN tools. Calm warm-dark surfaces, Pixelify Sans titles and key numbers, Atkinson Hyperlegible body, JetBrains Mono data, one shared accent, pixel icon family, palettes Nutmeg / Slate / Moss / Hibiscus / White build. Use with ../../ux/ when a project says "Style: avn-family".
---

# AVN Family

Fills every role in `../../contract.md`. Pair with `../../ux/`.

## Files
| File | What |
|---|---|
| `fonts.css` | Google Fonts import (Next.js: use next/font with the same families) |
| `tokens.css` | all contract roles, dark + light, 5 palettes |
| `flavour.css` | optional personal layer: pixel icons, status spark, boot, scenes, block piles, starfield |
| `FLAVOUR.md` | the motifs and their rules |
| `icons/` | pixel icons (10 × 10 SVG) |

There is no `skin.css`: AVN Family is the plain components (thin 1 px lines, no
offset shadows, 12 px card corners).

## Look
- **Type:** Pixelify Sans for page titles (~28 px), key numbers and drawer titles only. Atkinson Hyperlegible for body and controls. JetBrains Mono for data, IDs, event names and uppercase labels. No pixel font in tables, forms or paragraphs.
- **Colour:** warm neutrals with a slight hue toward the accent. One accent (Nutmeg `#FF7F45` dark / `#CF5418` light). Key numbers in plain text colour, not the accent.
- **Palettes** (`<html data-palette>`): none = **Nutmeg**, `slate`, `moss`, `hibiscus`, `white` (White build: white and carbon; status colours follow a controller's four face buttons: green verified, red failed, blue info, yellow warning).
- **Shape:** 1 px borders, 12 px cards, 9 px controls, no drop shadows on cards; overlays (drawers, popovers, toasts) get one soft shadow.
- **Background:** faint dot grid (`--dot`).

## Icons
Grammar shared by every AVN tool icon (`icons/`):
- 10 × 10 grid, crisp edges, reads at 16 px.
- Warm dark tile `#16120F` in every theme.
- The same one-pixel rounded frame, corners open.
- One idea inside in cream `#F1E7D6`, six pixels or fewer.
- One accent **spark** pixel outside the frame, placed where it hints the verb: PlayLens bottom-right (the lens handle: inspect), Analytics top-right (growth: measure), NutBot top-centre (antenna).
- The spark is a **status light** in tabs and the logo: accent idle, green live, amber needs a look, red error (blinks).
- Export 16, 32, 180 and 512 px from the same SVG. `template.svg` shows the taken spark spots.

## Moments
The flavour's animations follow `../../ux/references/motion.md`: boot (icon builds, name types in, starfield; 1.3 s, once a day), empty-state scenes, block piles that drop in once, a pixel burst on Verified.
