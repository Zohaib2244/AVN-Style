# AVN Style

A warm, dense, monospace front-end design language — **"Chunky Blocks + Accent Border"**.
Sticker cards with hard offset shadows and zero blur, two accent slots, 14 tokens ×
8 palettes × dark + light. Extracted from AVN Hub.

- `assets/tokens.css` — type scale, tokens, 8 palettes (dark + light)
- `assets/base.css` — frame, cards, controls, dialog, buttons, status
- `assets/fonts-standalone.css` — DotGothic16 + JetBrains Mono for non-Next projects
- `assets/preview.html` — open in a browser, no build step
- `SKILL.md` + `references/` — rules for humans and coding agents

```html
<link rel="stylesheet" href="assets/fonts-standalone.css">
<link rel="stylesheet" href="assets/tokens.css">
<link rel="stylesheet" href="assets/base.css">
<html data-theme="dark" data-palette="slate">
```

Palettes: ember (default), slate, moss, plum, reef, raspberry, circuit, graphite.
