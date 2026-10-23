# UX review · October 2026

What I found going through the whole system while porting the React Bits ideas, and what is worth doing next.
Each item says where it lives and how big it is. Nothing here is built unless marked.

## Built in 0.2.0
- Setup and pairing flows felt like forms → the **stepper**, **code slots** and **spring checks** (`ux/references/components.md`).
- State was hard to read at a glance → the **status mark** morphs instead of swapping icons; the **heartbeat** shows liveness; **call chips** show each tool's progress.
- Nothing felt alive → **ambient life** is now a budget of its own (`motion.md`): lattice loaders, the pixel field, scenes.

## Worth doing next (ordered)

1. **Pipeline packets should be data, not decoration.** `.pkt` moves on a timer whenever `live` is true. Drive it from real arrivals (the same `tick` the heartbeat uses) so a stalled pipeline *looks* stalled. Small; `cards.tsx` `Pipeline`, `feedback.md`.
2. **The sidebar count rule is too strict for live things.** Counts appear only for "needs a look", so a page receiving events shows a dot but no number. Allow one live count (`.cnt.info`) on the Data health item when the heartbeat is beating. Small; `shell.md`.
3. **Drawer-in-drawer needs breadcrumbs.** The back arrow works for one level, but a level → player → session chain loses the trail. Show the stack as crumbs in the drawer header (max 3). Medium; `overlays.tsx`, `components.md`.
4. **"Copy link" should confirm with the link itself.** The toast says "Link copied"; show the short form of the URL and the filters it carries so people trust it. Small; `tools.md`.
5. **Compare view: name the baseline.** The change cell says "less drop" but not relative to what; pin "A is the baseline" into the group header. Small; `data.md`.
6. **Empty states should offer the next action by default.** Several empty panels end with a sentence and no button (`NeedsALook` all-clear, highlights "Nothing matches"). The rule says one action; make `EmptyState` require it. Small; `primitives.tsx`.
7. **Density should also apply to the sidebar and drawers.** Compact only changes content padding and rows. Medium; `components.css` density block.
8. **Pocket needs a boot screen.** The power-LED boot is listed under "Ideas not built yet" in `styles/pocket/FLAVOUR.md`. Flavour-only, small.
9. **Keycap glyphs for the controller habit** (`styles/avn-family/FLAVOUR.md`): `kbd[data-key]` is needed in the UX markup first (a tiny contract-free change in `ShortcutsDialog`), then each flavour can draw face buttons. Small.
10. **Publish `@avn/ui`.** Tarballs work but every app pins a path. A GitHub Packages release on tag would remove the manual step. Medium; CI.

## Things I deliberately did not change
- The **one accent job per area** rule. The new components all keep it: the thumb, pill and glider use `--raise`, only the main button and the code wash use `--accent`.
- The **Verified is only ever set by a check** rule. `SpringCheck` cannot produce Verified; `StatusMark` can show it but nothing in the UI flips it by hand.
- **No single-letter shortcuts.** The picker's type-ahead only works while the list has focus, so it never fires while typing elsewhere.
