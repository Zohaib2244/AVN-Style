# Front-end stack

The default for every AVN dashboard and tool site. Deviate only with a written reason
in the project's `AGENTS.md`.

| Layer | Use | Notes |
|---|---|---|
| UI | **React 18 + TypeScript** | strict mode; function components |
| Build | **Vite** | static output; the backend serves the built files |
| Styling | **Plain CSS**: `ux/assets/components.css` + the style's `tokens.css` (+ optional `skin.css`, `flavour.css`) | **No Tailwind, no CSS-in-JS.** Components use contract roles only; app-specific CSS lives in small files next to the page and also uses roles only |
| Animation | **Motion** (`motion/react`) | enter/exit (drawers, toasts, popovers), the sliding nav highlight (`layoutId`), toast stacking (`layout`), number rolls. Follow `motion.md`; respect `useReducedMotion()`. Never put layout animation on dense grids or long lists |
| Shared components | **`@avn/ui`** (React package in this repo) | shell, nav, drawer, dialog, pickers, toasts + bell, command palette, tags, KPI, change cell, rule bar and editor, highlights, NutBot panel and answer blocks. Write a component here once; apps don't fork it |
| Server data | **TanStack Query** | loading/error/refresh map onto `feedback.md`; auto-refresh via `refetchInterval` |
| Routing / URL state | **TanStack Router** (React Router acceptable) | filters, range, view and density live in search params: "copy link to this view" |
| Tables | **TanStack Table** + **TanStack Virtual** for long lists (logs) | sticky headers, pinned first column, density |
| Accessible primitives | **Radix UI** primitives, unstyled | dialog, popover, dropdown menu, tooltip, tabs; styled with our classes |
| Command palette | **cmdk**, unstyled | |
| Charts | small in-house SVG components in `@avn/ui`; **uPlot** for fast live time series (PlayLens performance) | tokens for every colour; draw at real width |
| Tests | **Vitest** (logic, components) + **Playwright** (flows and the screenshot self-check at three widths) | |

## Backends stay as they are
- AVN Analytics: FastAPI serves the Vite build from `avn_analytics/static/`.
- AVN PlayLens: the Node server embeds the Vite build in its single executable.
- No server rendering is needed for these private, self-hosted tools (so no Next.js). AVN Hub keeps its own stack.
