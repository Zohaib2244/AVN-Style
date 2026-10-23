---
name: pocket-style
description: Pocket — a handheld console in cream for nutmag2469's tools: cream shell in light, backlit olive LCD in dark, Space Grotesk titles, Inter body, JetBrains Mono data, keys that press, one yellow face-button accent, palettes Cream / Mint / Lagoon / Grape. Use with ../../ux/ when a project says "Style: pocket".
---

# Pocket

Fills every role in `../../contract.md`. Pair with `../../ux/`. Pick it for tools you
want to feel like a handheld you enjoy picking up: warm, tactile, a little handmade.

## Files
| File | What |
|---|---|
| `fonts.css` | Google Fonts import (Next.js: use next/font with the same families) |
| `tokens.css` | all contract roles, light + dark, 4 palettes |
| `skin.css` | component looks: keys, rockers, keycaps, mono labels (optional, recommended) |
| `flavour.css` | optional personal layer: LCD panels, Dora scene, cartridge server, block piles, boot |
| `FLAVOUR.md` | the motifs and their rules |
| `scenes/` | `dora-lcd.svg`, `cartridge-server.svg` (1-bit, role colours only) |

Icons: Pocket reuses AVN Family's pixel icons (`../avn-family/icons/`); the icon CSS
is repeated in `flavour.css` so the same markup works. No icon files live here.

## Look
- **Type:** Space Grotesk 600 for page titles (~28 px), key numbers and drawer titles. Inter for body and controls. JetBrains Mono for data, IDs, event names and uppercase labels. Button text is the body face, no uppercase.
- **Colour:** light theme is the **cream shell** (page `#efe7d2`, panels `#f7f1e1`, warm khaki lines, warm near-black ink). Dark theme is the **backlit LCD**: olive-charcoal (`#171a12` / `#20241a`) with cream text. One accent, a yellow face button (`#d9a400` light / `#ffd23f` dark) with ink text on it. Key numbers in plain text colour.
- **Status:** distinct from the accent: Verified LCD green, Done teal, Info blue, New violet, Warning **orange** (never yellow), Failed red. Constant across palettes.
- **Palettes** (`<html data-palette>`): none = **Cream** (yellow), `mint` (DMG green shell, coral button; dark stays olive tinted mint), `lagoon` (teal-blue shell, yellow button), `grape` (purple shell, lime button).
- **Shape:** chunky and rounded: 16 px cards, 12 px controls, 1.5 px borders. Cards sit like keys on a 2 px bottom edge (`--lift`), buttons on 3 px. `--ease` is a soft ease-out; `--ease-spring` is a back-out with visible overshoot.
- **Background:** faint dot grid (`--dot`).

## Skin
`skin.css` makes components tactile without moving anything: `.btn` presses down 3 px on `:active`; `.btn.primary` is the yellow face button; `.seg` and `.platforms` are a rocker (inset well, the `.on` option raised); `.eyebrow`, `.t th`, `.tag` stay mono uppercase with slightly rounder tags; panels lift 1 px on hover; `kbd` keycaps get a bottom edge; inputs are wells. Roles only, no raw colours.

## Flavour
`flavour.css` + `FLAVOUR.md`: `.lcd` (an inset screen panel, slightly green), 1-bit scenes (`.scene` with `breathe`, `zz`, `blink`, `tw` ear twitch, `pk` packets, `cart` seating), `.iso` block piles that drop in with the spring curve, `.boot-ov`, `.srv-art`. The class names match AVN Family's where the job is the same, so the UX markup is identical.

## Moments
The flavour's animations follow `../../ux/references/motion.md`: boot (name types in; 1.3 s, once a day), the Dora scene for "nothing needs you", the cartridge server for the status page, block piles that drop in once. Reduced motion shows every still frame.
