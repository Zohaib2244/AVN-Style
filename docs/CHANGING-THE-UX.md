# Changing the UX

UX = how the tool works for every style. Do it in this order so the rules, the CSS, the React components and the board
never drift apart.

**Is it UX or style?** Ask: *"If I changed the whole look tomorrow, would this still be true?"*
Yes → UX (here). No → style (see `ADDING-A-STYLE.md`).

## The loop

1. **Write the rule.** Edit the matching file in `ux/references/` (shell, pages, components, pickers, data,
   rules-and-highlights, feedback, tools, assistant, motion, foundations). One rule = one short sentence plus the reason.
   If it applies to every page, also add it to the self-check in `ux/references/process.md`.
2. **Update the CSS** in `ux/assets/components.css`. Use only contract roles (`var(--panel)`, `var(--accent)` …).
   Never a hex colour, font name or pixel radius that belongs to a style.
3. **Update the React component** in `packages/ui/src/` and its test in `packages/ui/test/`.
   The `css-contract` test fails if a component uses a class that `components.css` lacks.
4. **Update the board** (`board/index.html`) so the live reference shows it.
5. **Check**: `npm run check` (style contract, types, tests, build), then look at the board in both styles,
   dark and light, wide / tablet / phone.
6. **Record it**: add a line to `CHANGELOG.md`; bump `packages/ui/package.json` version if components changed.

## Common changes

| Change | Where |
|---|---|
| Move a nav item, change breakpoints, change the shell | `ux/references/shell.md`, `.app-root` container queries in `components.css`, `packages/ui/src/shell.tsx` |
| New page pattern | `ux/references/pages.md`, then compose it from existing components; add a section to the board |
| New component | rule in `components.md`; CSS block in `components.css`; component + test; export in `src/index.ts`; board |
| New status kind or highlight colour | **contract change**, see below |
| Wording (toasts, empty states, buttons) | `ux/references/foundations.md` words section, then the component text and its test |
| New NutBot answer block | `ux/references/assistant.md`, `src/assistant.tsx` (`Block`), test |
| Motion | `ux/references/motion.md`, use `motion/react`, respect `useReducedMotion` |

## Changing the contract

Adding a role means every style must fill it.

1. Add it to `contract.md` in the right table (the checker reads the first column of the tables).
2. Add it to every style's `tokens.css` (`styles/avn-family`, `styles/nutstyle`, `styles/_template`).
3. `npm run check-styles` until it passes for all.
4. Use the new role in `components.css`.

Renaming or removing a role is a breaking change: grep all styles and `components.css`, bump the minor version, note it in
`CHANGELOG.md`.

## Rules of thumb

- Prefer changing an existing component to adding a new one.
- A UX change must not need a style change, except when it adds a contract role.
- If a rule can't be tested or seen on the board, it will drift. Add the test or the board example.
