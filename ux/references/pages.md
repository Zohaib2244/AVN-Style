# Page patterns

Every page is one of these. Pick before you draw.

## Briefing overview (a game's home)
Top to bottom:
1. **Setup checklist** until every step is verified (`tools.md`). Collapsible.
2. **What changed** — up to 3 insight cards: kind tag (Better/Worse), one-line headline, one detail line, link to the page that explains it.
3. **Key numbers** — up to 4 KPIs, each with a sparkline and a comparison with the previous period.
4. **Main chart + "Needs a look"** side by side (stacked on narrow).
5. **Sections at a glance** — one tile per section: its headline number, a tiny visual, "Open …". Pinned NutBot answers appear here too.

## List / table
Filter bar → optional rule bar (`rules-and-highlights.md`) → optional summary strip → table. Rows open the **inspector drawer**. Empty result: block-pile empty state with a way out ("Loosen a rule or switch AND to OR").

## Live monitor (health, plugin health, sessions)
Status strip (live dot, last event, today's count, overall tag) → chart + "Needs a look" → pipeline timeline (Verified / Done / waiting steps, packets moving while live) → recent activity table (e.g. deliveries: delivered, delivered after retry, rejected with reason).

## Setup flow (pairing, SDK setup, rules file)
The **stepper** (`components.md`): a track of step tiles with a glider on the current one, one pane at a time, Back / Continue in the footer, panes sliding in the direction of travel. Steps use Done → Verified states; a step's mark morphs to the check when it verifies. Codes are entered in code slots. Never more than one decision per step.

## Settings
Sections of labelled fields. A **Danger zone** card at the end: reversible actions (archive) act immediately with Undo; permanent ones (delete data) open the typed-confirm dialog (`feedback.md`).

## Games home
Grid of **game status cards** (`components.md`) plus a dashed "Register a game" card. Each card is one link.

## Server status
Picture of the machine (style flavour), Online state and uptime, KPIs (CPU, memory, disk, temperature), then a services list with Verified/Done tags. Backups are Done when they run and Verified only after a test restore.

## Detail via drawer, not new pages
Detail of a row, level, player or chart point opens in the **inspector drawer** (`components.md`) so the page keeps its place. Only make a new page when the thing has its own sections and its own URL people share often.
