---
name: nutstyle
description: AVN Style / Nutstyle — warm, dense, monospace "Chunky Blocks + Accent Border" front-end design system extracted from AVN Hub. Use before writing any UI, CSS or HTML for the user's web projects so the look matches AVN Hub.
---

# AVN Style (Nutstyle)

Warm, dense, monospace. Sticker cards with a **hard offset shadow and zero blur**,
two accent slots, 14 tokens × 8 palettes × dark + light, root font-size 17px.
AVN Hub is the source of truth for the look; this package is the portable copy.

## Use it
1. Include `assets/tokens.css`, then `assets/base.css`.
2. Fonts: DotGothic16 (labels, stats, titles) + JetBrains Mono (content). Next.js: `next/font/google` with variables `--font-dot-gothic` and `--font-jetbrains-mono`. Anything else: add `assets/fonts-standalone.css`.
3. Pick a mode and palette on `<html>`: `data-theme="light|dark"` (dark default) and `data-palette="slate|moss|plum|reef|raspberry|circuit|graphite"` (none = ember).
4. Open `assets/preview.html` in a browser to see every token and component.

## Hard rules
- Every colour is a token. No raw hex, no pure black/white.
- Cards: `border-radius` 12–16px, `1.5px solid var(--border)`, `box-shadow: 3–5px 3–5px 0 var(--shadow)`. **Never blur a shadow.**
- Font sizes come only from the five-step scale `--fs-micro|label|body|lead|stat`. No ad-hoc rem/px.
- Text colour is a role: `--text-muted-dim` = labels, `--text-muted` = content. Do not swap them.
- Accent slots are named `--accent-orange` (primary) and `--accent-cyan` (secondary) regardless of actual hue.
- Never: Inter/Roboto/Arial/system fonts, purple gradients, neon glow, CRT scanlines/grain, centered portfolio layouts.
- Both themes are first-class — check dark and light.

## Read next
`references/tokens.md` · `typography.md` · `components.md` · `motion.md` · `layout.md` · `porting.md`
