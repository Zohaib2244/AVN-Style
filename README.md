# AVN Style

The design system for the AVN game-dev tools (AVN Analytics, AVN PlayLens, and whatever comes next).

It is split into two layers so the look can change without touching how things work:

```
┌──────────────────────────────────────────────────────────────┐
│  UX        how the tool works                  ux/            │  one set of rules, shared by every style
│            pages, navigation, pickers, rules,                 │
│            loading/errors/toasts, assistant                   │
├──────────────────────────────────────────────────────────────┤
│  Contract  the roles a style must fill        contract.md     │  the handshake between the two layers
├──────────────────────────────────────────────────────────────┤
│  Style     how it looks                       styles/<name>/  │  swappable: colours, fonts, shape, icons, flavour
└──────────────────────────────────────────────────────────────┘
```

Pick any style for any project, add new ones whenever you like, and the UX keeps working.

**Open `board/index.html` in a browser first.** It is the live style board: every pattern working, both styles,
every palette, dark and light, wide / tablet / phone. Everything below describes what you see there.

---

## What it covers

| Piece | Where | What it is |
|---|---|---|
| **UX rules** | `ux/SKILL.md`, `ux/references/` | Rules for agents and humans: how to take a request, app shell, page patterns, components, pickers, dense data, funnels, rules and highlights, loading / errors / toasts, command palette and other tools, the NutBot assistant, motion, and the front-end stack. |
| **Components (CSS)** | `ux/assets/components.css` | Every component as plain CSS, using only contract roles. Works without React. |
| **Components (React)** | `packages/ui` → `@avn/ui` | The same components as React + TypeScript with Motion animation: shell, nav, drawer, dialogs, pickers, toasts, command palette, rule editor, highlights, funnel, charts, compare table, setup checklist, stepper, code slots, status marks, spring checks, lattice loader, heartbeat, branch list, pixel field, NutBot panel with thought line, call chips and prompt bar, pixel icons. 162 tests. |
| **Contract** | `contract.md` | The list of roles (`--bg`, `--panel`, `--accent`, `--ok`, `--done` …) every style fills. |
| **Style: AVN Family** | `styles/avn-family/` | The default look. Calm warm-dark surfaces, Pixelify titles, pixel icons, personal flavour. Palettes: Nutmeg (default), Slate, Moss, Hibiscus, White build, Chiral, Dora. |
| **Style: Nutstyle** | `styles/nutstyle/` | AVN Hub's original look (chunky sticker cards, DotGothic, offset shadows), converted to the contract. 8 palettes. Old token names kept as aliases so AVN Hub keeps working. |
| **Style template** | `styles/_template/` | Start here for a new style. |
| **Suggestions** | `docs/SUGGESTIONS.md` | A review of the UX with the improvements worth doing next. |
| **Style checker** | `scripts/check-style.mjs` | Fails if a style leaves out a contract role. |
| **Board** | `board/index.html` | The live reference. |
| **Example** | `examples/minimal.html` | A plain-HTML page (no build) with switchers for style, palette and theme. Also previews a new style. |
| **AVN Hub** | `avnhub-design/` | Hub's own canvas / dock / widget architecture. Separate from the UX layer; uses Nutstyle for its look. |

**Scope.** Dashboards and tool sites. The *Foundations* rules (words, accessibility, responsive, density) apply to any web app.
Not covered: landing pages, marketing sites, in-game UI.

### What's in the UX

Navigation and shell (grouped sidebar with one sliding highlight, icon rail on tablet, tab bar on phone) ·
briefing overview (setup checklist, what changed, key numbers with sparklines, sections at a glance) ·
inspector drawer · multi-select, single-select and date-range pickers · dense tables and compare view ·
level curve + heat strip · visual funnel · rule bar, rule sentences, rule editor, timeline highlights ·
loading (skeleton + status line), errors (where each kind goes), toasts (stacking, auto-fade, dismiss), notifications bell,
undo vs typed confirmation · command palette, copy-link, definitions, keyboard shortcuts, freshness stamps ·
Done → Verified status vocabulary · NutBot assistant (context chips, thought line, call chips, prompt bar with @ context and / commands, answer blocks, confirm before changing) ·
**moments and ambient life** (status marks that morph, spring checks, rubber segmented thumb, gliding picker pill, code slots, stepper, heartbeat, lattice loader, branch list, pixel field, warm definitions) · motion rules.

---

## Quick start

### 1. Look at it
Open `board/index.html` (double-click; no server needed).

### 2. Plain HTML (no build)

```html
<link rel="stylesheet" href="styles/avn-family/fonts.css">
<link rel="stylesheet" href="styles/avn-family/tokens.css">
<link rel="stylesheet" href="ux/assets/components.css">
<link rel="stylesheet" href="styles/avn-family/flavour.css"> <!-- optional -->

<html data-theme="dark" data-palette="slate">   <!-- both optional -->
```

See `examples/minimal.html`. To use Nutstyle instead, swap the first two links to `styles/nutstyle/` and use
`skin.css` in place of `flavour.css`. Nothing else changes.

### 3. React

```tsx
import { AppShell, Sidebar, SidebarNav, ToastProvider /* … */ } from '@avn/ui';
```

Install steps (alias to the source, or a tarball) are in [`docs/USING-IN-A-PROJECT.md`](docs/USING-IN-A-PROJECT.md).
The component list and examples are in [`packages/ui/README.md`](packages/ui/README.md).
To run the demo: `npm install && npm run demo` (then open http://localhost:5199).

### 4. Tell the agents

Add one line to a project's `AGENTS.md` / `CLAUDE.md` so Claude and Codex read the rules before touching UI:

```
Design: follow AVN-Style (SKILL.md). UX: avn-ux · Style: avn-family
```

---

## How the layers fit

**UX** decides what is on each page and in what order, how things behave, the words, the breakpoints, and which *role*
something has ("main action", "status: failed", "highlight colour 3"). It never names a colour or font.

**A style** decides what those roles look like: colours in both themes, fonts, border width, corner sizes, shadows,
icons, and flavour. A style may not move, hide or add elements, or change behaviour or words. That would be a UX change.

**The contract** (`contract.md`) is the list of roles in between. A style fills every role; components use only those roles.

Rule of thumb for deciding where something goes: *"If I changed the whole look tomorrow, would this still be true?"*
Yes → UX. No → style.

Optional style files: `skin.css` (component looks such as sticker shadows or uppercase labels) and `flavour.css` +
`FLAVOUR.md` (art, icons, motifs, personal touches). The UX must work without either.

---

## Styles available

| Style | Palettes | Notes |
|---|---|---|
| `avn-family` | none (**Nutmeg**), `slate`, `moss`, `hibiscus`, `white`, `chiral`, `dora` | Pixelify Sans titles, Atkinson Hyperlegible body, JetBrains Mono data. Pixel icons with a spark pixel that doubles as a status light. [`FLAVOUR.md`](styles/avn-family/FLAVOUR.md) lists the personal motifs and their rules. |
| `nutstyle` | none (ember), `slate`, `moss`, `plum`, `reef`, `raspberry`, `circuit`, `graphite` | DotGothic16 + JetBrains Mono, hard offset shadows. `hub-base.css` holds AVN Hub's own classes. |
| `pocket` | none (**Cream**), `mint`, `lagoon`, `grape` | A handheld console in cream: cream shell in light, backlit olive LCD in dark. Space Grotesk titles, Inter body, JetBrains Mono data, keys that press (`skin.css`), one yellow face-button accent. [`FLAVOUR.md`](styles/pocket/FLAVOUR.md) lists the motifs (blocks, the mini PC as a cartridge, Dora on the LCD). |

Switch with attributes on `<html>`: `data-theme="light|dark"` (default follows the system) and `data-palette="…"`.

---

## Customizing

| I want to… | Read |
|---|---|
| **Change how something works** (a page pattern, a component, a behaviour, wording) | [`docs/CHANGING-THE-UX.md`](docs/CHANGING-THE-UX.md) |
| **Add a new look** (a new style or palette) | [`docs/ADDING-A-STYLE.md`](docs/ADDING-A-STYLE.md) |
| **Use it in a project** (plain HTML, React, agents, backends) | [`docs/USING-IN-A-PROJECT.md`](docs/USING-IN-A-PROJECT.md) |
| **Change personal touches** (Dora, palettes named after things you like, scenes) | [`styles/avn-family/FLAVOUR.md`](styles/avn-family/FLAVOUR.md) |

The short version:

- **New look** → copy `styles/_template/`, fill the tokens, run `npm run check-styles`, preview with
  `examples/minimal.html?style=<name>`. No UX change needed.
- **New palette in an existing style** → add a `:root[data-palette="name"] { … }` block to its `tokens.css`.
- **UX change** → edit the rule in `ux/references/`, then the CSS, then the React component and its test, then the board; run `npm run check`.

---

## Commands

Run from the repo root (Node 20+):

| Command | What it does |
|---|---|
| `npm install` | install everything (workspaces) |
| `npm run check` | style contract check + type-check + all tests + build. Run before every commit |
| `npm run check-styles` | does every style in `styles/` fill every contract role? |
| `npm test` | the `@avn/ui` tests |
| `npm run build` | build `@avn/ui` to `packages/ui/dist` |
| `npm run demo` | the React demo at http://localhost:5199 (style, theme switchers) |

## Quality

- **162 tests** (Vitest + Testing Library): pure logic (change cell, toast stacking and dedupe, date ranges, command-palette scoring,
  condition matching, funnel and compare maths, pixel-icon grammar, code-slot editing, prompt tokens), and behaviour (drawer, pickers, typed confirmation, rule
  editor, highlights, setup checklist, stepper, code slots, status marks, spring checks, thought line and call chips, prompt bar, NutBot proposals).
- **A CSS guard**: every class a component uses must exist in `components.css`.
- **A style checker** with its own tests, including a style that deliberately leaves a role out.
- Checked by hand in a browser: three styles, every palette in dark and light, wide / tablet / phone.

## Stack

React + TypeScript + Vite, plain CSS (no Tailwind), Motion for animation, Radix (Dialog, Tooltip), TanStack in apps.
Reasons and the full table: [`ux/references/stack.md`](ux/references/stack.md).

## Status and what's next

- **Done here:** UX rules, contract, two styles, `@avn/ui`, checker, board, example, docs.
- **Not done yet (separate repos, separate pull requests):**
  - moving AVN Analytics and AVN PlayLens onto this (their `AGENTS.md` still points at the old Nutstyle skill),
  - the server side of NutBot's richer answers (Analytics: structured blocks and proposal confirmation; PlayLens: its own tools),
  - publishing `@avn/ui` as a package (today apps alias to the source or use a tarball; see the using-in-a-project doc).
- Version history: [`CHANGELOG.md`](CHANGELOG.md).

## Repo map

```
SKILL.md                  entry point for agents
contract.md               roles every style fills
ux/
  SKILL.md                the UX rules (start here)
  references/*.md         process, foundations, stack, shell, pages, components, pickers, data,
                          rules-and-highlights, feedback, tools, assistant, motion
  assets/components.css   all components, contract roles only
styles/
  avn-family/             tokens, fonts, flavour, FLAVOUR.md, icons/
  nutstyle/               tokens, skin, fonts, hub-base.css, references/
  _template/              start a new style
packages/ui/              @avn/ui (React): src/, test/, demo/
board/index.html          live style board
examples/minimal.html     plain-HTML example + style previewer
scripts/check-style.mjs   contract checker
avnhub-design/            AVN Hub's own architecture
docs/                     using it, changing the UX, adding a style
AGENTS.md                 rules for agents working in this repo
```
