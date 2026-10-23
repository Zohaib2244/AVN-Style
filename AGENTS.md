# AGENTS.md (AVN-Style)

This repo is the design system: UX rules (`ux/`), the contract (`contract.md`), swappable styles (`styles/`), and the
React package `@avn/ui` (`packages/ui`).

- Start at `README.md`. Entry point for design work: `SKILL.md`.
- UX vs style: if the change would still be true after a total re-skin, it's UX; otherwise style. UX never names a colour or font; styles never move, hide or add elements.
- Changing the UX: follow `docs/CHANGING-THE-UX.md` (rule → CSS → component + test → board → check).
- Adding a style or palette: `docs/ADDING-A-STYLE.md`.
- Before every commit: `npm run check` must pass (style contract, types, tests, build).
- New contract role = add it to every style (`npm run check-styles`).
- Don't open pull requests or merge unless asked. Don't add hex colours or font names to `ux/assets/components.css` or `packages/ui/src`.
