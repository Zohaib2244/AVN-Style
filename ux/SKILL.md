---
name: avn-ux
description: AVN UX — the style-independent UX rules for Zohaib's dashboards and tool sites (AVN Analytics, AVN PlayLens, new tools). Page patterns, navigation, components, pickers, dense data, rules and highlights, loading/errors/toasts, command palette, NutBot assistant, motion. Read before building or changing any page; pair with a style from ../styles/.
---

# AVN UX

How the tools **work**. Nothing here names a colour, font or size: those are roles
from `../contract.md`, filled by whichever style the project uses. If you changed
the whole look tomorrow, every rule here would still be true.

**Scope.** Dashboards and tool sites. `references/foundations.md` applies to any web
app. Not covered: landing pages, marketing sites, in-game UI, AVN Hub (see
`../avnhub-design/`).

## The non-negotiables

1. **Tokens only.** No raw colours, font families or radii in components. Use
   `assets/components.css` and the contract roles.
2. **Pick a page pattern before drawing anything** (`references/pages.md`). New
   features slot into an existing pattern; they don't invent a layout.
3. **Nothing hidden changes the numbers.** Every active filter, rule, option or
   highlight is visible as a chip or bar, never inside a collapsed section.
4. **Summary before detail.** Headline → key numbers → chart → table → drawer.
5. **Data gets the room.** Data pages have no max width; explanations go in
   footnotes or tooltips, not paragraphs above the table.
6. **One accent job per area:** the main action, the active item, the highlighted
   data point. Status colours mean state only.
7. **Every state has a word**, not just a colour.
8. **Reversible actions undo from the toast; permanent ones ask you to type the name.**
9. **Works at three widths** (wide, tablet rail, phone tab bar) and by keyboard.
10. **Animation has a job.** Moments play once; ambient life (a loader, a live dot,
    a pixel field on an empty state) may loop quietly, one per view, never on data;
    all of it stops with reduced motion.

## Read next

| File | Covers |
|---|---|
| `references/stack.md` | the front-end stack: React + TypeScript + Vite, plain CSS, Motion, @avn/ui, TanStack, Radix |
| `references/process.md` | how to take a request, mockups first, turning complaints into rules, the self-check |
| `references/foundations.md` | words, accessibility, responsiveness, density (any web app) |
| `references/shell.md` | app shell: sidebar, sliding highlight, top bar, filter bar, rail and tab bar |
| `references/pages.md` | page patterns: briefing overview, list, live monitor, setup flow, settings, games home, server status |
| `references/components.md` | buttons, tags and status kinds, KPIs, change cell, game card, drawer, dialog, empty states |
| `references/pickers.md` | multi-select list, single-select list, date range |
| `references/data.md` | dense tables, compare view, curve + heat strip, funnel, charts |
| `references/rules-and-highlights.md` | rule bar, rule sentences, rule editor, timeline highlights |
| `references/feedback.md` | loading, errors, toasts, notifications, undo vs confirm, freshness |
| `references/tools.md` | command palette, copy link, definitions, shortcuts, setup checklist |
| `references/assistant.md` | NutBot: the assistant pattern every AVN tool shares |
| `references/motion.md` | moments and ambient life, the two motion budgets, what moves and what doesn't |

`../board/index.html` shows every rule working.
