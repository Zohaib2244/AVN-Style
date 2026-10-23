# Changelog

## 0.2.0

**Delight: moments and ambient life.** Fourteen behaviours adapted from React Bits onto the contract roles, each with a job (see `ux/references/motion.md`). No new dependencies.

- **Contract:** new role `--ease-spring` (the landing curve with overshoot). Every style sets it; nutstyle lands in steps, pocket bounces.
- **UX rules:** two motion budgets (moments play once; ambient life may loop quietly, one per view, never on data); status mark, spring check, stepper, code slots, heartbeat, branch list and pixel field in `components.md`; gliding pill in `pickers.md`; lattice loader in `feedback.md`; thought line, call chips and the prompt bar in `assistant.md`; warm definitions and pairing codes in `tools.md`; the setup flow is the stepper in `pages.md`; one more line on the self-check.
- **`components.css`:** `.smark` `.schk` `.lattice` `.seg.rubber` `.pop-pill` `.slots` `.stepper` `.pbar` `.callchip` `.thought` `.beat` `.branch` `.pxhost`/`.pxfield` and the warm `.def` fuse.
- **`@avn/ui` 0.2.0:** `StatusMark`, `SpringCheck`, `Lattice`, `Heartbeat`, `BranchList`, `CodeSlots`, `Stepper`/`Step`, `PixelField`, `ThoughtLine`, `ToolCallChip`, `PromptBar`, `DefinitionGroup`. `Segmented` has a rubber thumb and arrow keys (now `role="radiogroup"`); `SingleSelect` has a gliding pill, arrow keys and type-ahead; `SetupChecklist`, `Pipeline` and NutBot checklists use `StatusMark`; `StatusStrip` takes `tick`/`count` for the heartbeat; `NutBotPanel` renders the thought line and the prompt bar (`onStop`, `commands` props). 162 tests.
- **Styles:** new **pocket** style (cream handheld, backlit-LCD dark, Space Grotesk + Inter + JetBrains Mono, keys that press, palettes Cream / Mint / Lagoon / Grape, flavour with Dora on the LCD, the cartridge server and block piles). **avn-family** gets the `chiral` and `dora` palettes and the quiet-night scene.
- **Board:** a Delight section with every new pattern working in plain JS; Pocket in the style switch with its palettes; motion text updated.
- **Docs:** `docs/SUGGESTIONS.md` (the UX review and what to do next); template checklist extended.
- **Breaking (small):** `Segmented` buttons are `role="radio"` (tests that looked for `button` need `radio`); `NutBotPanel`'s send button becomes **Stop** while busy instead of a disabled Send.

## 0.1.0

- Split the old Nutstyle skill into a UX layer (`ux/`), a contract (`contract.md`) and swappable styles (`styles/`).
- Styles: `avn-family` (default, 5 palettes, pixel icons, flavour), `nutstyle` (converted, 8 palettes), `_template`.
- UX rules: foundations, shell, pages, components, pickers, data, rules and highlights, feedback, tools, NutBot assistant, motion, stack.
- `ux/assets/components.css`: all components on contract roles.
- `@avn/ui` 0.1.0: React + TypeScript + Motion components with tests.
- `scripts/check-style.mjs`, `examples/minimal.html` (style/palette/theme previewer), `board/index.html` (live board).
- Docs: README, using in a project, changing the UX, adding a style.
