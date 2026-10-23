---
name: my-style
description: One sentence: what this style looks like and when a project should pick it.
---

# My style

## Make it
1. Copy this folder to `styles/<name>/` and rename `name:` above.
2. Fill **every** role in `tokens.css` (dark and light). Keep the derived lines unless you have a reason.
3. Optional: `fonts.css`, `skin.css` (component looks: shadows, label case, hover, how keys press), `flavour.css` + `FLAVOUR.md` (art, icons, motifs). `../pocket/` is a complete worked example of all five files; `../avn-family/` of a flavour with scenes.
4. Check it on `../../board/index.html` (or a copy that links your files): every page, both themes, every palette, three widths.

## Checklist
- [ ] Every contract role is set, in both themes; no partial palettes.
- [ ] `--muted` on `--panel` ≥ 7:1 and `--dim` on `--panel` ≥ 4.5:1, dark and light.
- [ ] Status kinds are distinct from each other and from the accent.
- [ ] Display font has a real fallback stack and is readable at 28 px; numbers align.
- [ ] Nothing in `skin.css` moves, hides or adds elements (that would be a UX change).
- [ ] Reduced motion still shows every final state.
- [ ] `--ease-spring` matches the style's character (bouncy, calm, or stepped); check it on the Delight section of the board: the segmented thumb, a spring check, the code slots.
- [ ] Ambient life reads quietly on your surfaces: the lattice cells, the pixel field (≤ 8 %) and the heartbeat glow are visible but never louder than the data.

## Look
Describe the type, colour, shape and any flavour here, the way `../avn-family/SKILL.md` does.
