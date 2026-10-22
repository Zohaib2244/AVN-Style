# Adding a style (or a palette)

A style is only *how it looks*. You never touch the UX to add one.

## A. New palette in an existing style (5 minutes)

1. Open `styles/<style>/tokens.css`.
2. Copy an existing `:root[data-palette="…"]` block, rename it, change the colours.
   Keep every role that the block sets in **both** themes using `light-dark(light, dark)`.
3. `npm run check-styles`
4. Preview: open `examples/minimal.html?style=<style>` and pick the palette in the switcher.
5. Add the palette name to the table in `README.md` and to the style's `SKILL.md`.

## B. New style (about an hour)

1. **Copy the template**
   ```
   cp -r styles/_template styles/my-style
   ```
   Rename `name:` in `styles/my-style/SKILL.md` and describe the look.
2. **Fill `tokens.css`.** Every role in [`contract.md`](../contract.md) must be set: surfaces and text, accent,
   status (`--ok` Verified, `--done`, `--info`, `--new`, `--warn`, `--bad` plus `-soft`), the six highlight colours, type
   (`--font-px/ui/mono/label/btn`), shape (`--r-card --r-ctl --bw --shadow-c --lift --lift-btn --ease`).
   Use `light-dark()` with `color-scheme` so dark and light both work.
3. **Fonts** (optional): `fonts.css` with `@font-face` or a Google Fonts `@import`. Give every font a real fallback stack.
4. **Skin** (optional): `skin.css` for component looks, such as hard shadows, uppercase labels, hover effects.
   It may restyle. It may **not** move, hide or add elements, change behaviour, or change words. That would be a UX change.
5. **Flavour** (optional): `flavour.css` + `FLAVOUR.md` for art, icons, motifs. The UX must work without it.
6. **Check**
   ```
   npm run check-styles                       # every contract role present?
   open examples/minimal.html?style=my-style  # add &palettes=a,b&extra=skin.css if you have them
   ```
   Then open `board/index.html`, point its `<link>`s at your files, and look at every page in dark and light at wide,
   tablet and phone widths.
7. **Register it**: add a row to the styles table in `README.md` and `SKILL.md`.

## Checklist (also in `_template/SKILL.md`)

- [ ] Every contract role set, in both themes.
- [ ] `--muted` on `--panel` at least 7:1, `--dim` on `--panel` at least 4.5:1.
- [ ] The six status kinds look different from each other and from the accent.
- [ ] Display font readable at 28 px; numbers line up (`--num`, tabular figures).
- [ ] Reduced motion still shows every final state.
- [ ] Nothing in `skin.css` moves, hides or adds elements.

## Using the new style in a project

Load its files in the order `fonts.css`, `tokens.css`, `ux/assets/components.css`, `skin.css`/`flavour.css`.
In React, `npm run sync-css -w @avn/ui` copies every style folder (not starting with `_`) into `packages/ui/css/<style>/`.
Then tell the project's `AGENTS.md`: `Style: my-style`.
