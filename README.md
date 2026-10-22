# AVN Style

Design system for Zohaib's game-dev tools (AVN Analytics, AVN PlayLens, and whatever
comes next), split so the look can change without touching how things work.

```
SKILL.md              entry point for agents: read this first
contract.md           the roles every style fills (colours, type, shape)
ux/                   avn-ux: the UX rules, one set for every style
  SKILL.md
  references/         process, foundations, shell, pages, components, pickers,
                      data, rules & highlights, feedback, tools, assistant, motion
  assets/components.css   all components, using contract roles only
styles/
  avn-family/         default look: tokens, skin-free, flavour, icons
  nutstyle/           AVN Hub's look, converted to the contract (old names kept)
  _template/          start a new style here
avnhub-design/        AVN Hub's own canvas / dock / widget architecture
board/index.html      live style board: open in a browser
```

## Use it in a project

```html
<link rel="stylesheet" href="styles/avn-family/fonts.css">
<link rel="stylesheet" href="styles/avn-family/tokens.css">
<link rel="stylesheet" href="ux/assets/components.css">
<link rel="stylesheet" href="styles/avn-family/flavour.css"> <!-- optional -->
<html data-theme="dark" data-palette="slate">
```

And one line in the project's `AGENTS.md` / `CLAUDE.md`:

```
Design: follow AVN-Style (SKILL.md). UX: avn-ux · Style: avn-family
```

Switching style later is changing that line and the stylesheet links.
