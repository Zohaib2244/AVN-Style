# Front-end stack

The default for every AVN dashboard and tool site. Deviate only with a written reason
in the project's `AGENTS.md`.

| Layer | Use | Notes |
|---|---|---|
| UI | **React 18 + TypeScript** | strict mode; function components |
| Build | **Vite** | static output; the backend serves the built files |
| Styling | **Plain CSS**: `ux/assets/components.css` + the style's `tokens.css` (+ optional `skin.css`, `flavour.css`) | **No Tailwind, no CSS-in-JS.** Components use contract roles only; app-specific CSS lives in small files next to the page and also uses roles only |
| Animation | **Motion** (`motion/react`) | enter/exit (drawers, toasts, popovers), the sliding nav highlight (`layoutId`), toast stacking (`layout`), number rolls. Follow `motion.md`; respect `useReducedMotion()`. Never put layout animation on dense grids or long lists |
| Shared components | **`@avn/ui`** (React package in `packages/ui`) | shell, nav, drawer, dialogs, pickers, toasts + bell, command palette, tags, KPI, change cell, rule bar and editor, highlights, funnel, charts, compare table, setup checklist, game cards, pixel icons, NutBot panel and answer blocks. Write a component here once; apps don't fork it. Full list: `packages/ui/README.md` |
| Server data | **TanStack Query** (apps; not bundled in `@avn/ui`) | loading/error/refresh map onto `feedback.md`; auto-refresh via `refetchInterval` |
| Routing / URL state | **TanStack Router** (apps; React Router acceptable) | filters, range, view and density live in search params: "copy link to this view" |
| Tables | **TanStack Table** + **TanStack Virtual** for long lists such as logs (apps) | sticky headers, pinned first column, density |
| Accessible primitives | **Radix UI**, unstyled | `@avn/ui` uses Radix **Dialog** (focus trap, aria, Esc) and **Tooltip** (definitions), styled with our classes. Pickers use `@avn/ui`'s own `Popover`, which opens inside the app frame so the CSS can turn it into a bottom sheet on phones. Use Radix for anything new (menus, tabs) |
| Command palette | `@avn/ui` `CommandPalette` | own implementation (prefix > contains > hint > in-order letters scoring, keyboard, "Ask NutBot" item); no extra dependency |
| Charts | small in-house SVG components in `@avn/ui`; **uPlot** for fast live time series (PlayLens performance) | tokens for every colour; draw at real width |
| Tests | **Vitest** (logic, components) + **Playwright** (flows and the screenshot self-check at three widths) | |

## Backends stay as they are
- AVN Analytics: FastAPI serves the Vite build from `avn_analytics/static/`.
- AVN PlayLens: the Node server embeds the Vite build in its single executable.
- No server rendering is needed for these private, self-hosted tools (so no Next.js). AVN Hub keeps its own stack.
