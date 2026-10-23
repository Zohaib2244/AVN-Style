# Using AVN Style in a project

## 1. Tell the agents

In the project's `AGENTS.md` / `CLAUDE.md`:

```
Design: follow AVN-Style (SKILL.md in the AVN-Style repo). UX: avn-ux · Style: avn-family
```

Agents then read `SKILL.md` → `ux/SKILL.md` → the style's `SKILL.md` before touching UI, and run the self-check in
`ux/references/process.md` before saying they're done. If the agent can't see the repo, copy `SKILL.md`, `contract.md`,
`ux/` and the chosen `styles/<name>/` into the project (for example under `design/`).

## 2. Plain HTML / server-rendered pages

Copy `ux/assets/components.css` and the style folder (`fonts.css`, `tokens.css`, optional `skin.css` / `flavour.css`).

```html
<link rel="stylesheet" href="/design/styles/avn-family/fonts.css">
<link rel="stylesheet" href="/design/styles/avn-family/tokens.css">
<link rel="stylesheet" href="/design/ux/assets/components.css">
<link rel="stylesheet" href="/design/styles/avn-family/flavour.css">
```

Order matters: tokens → components → skin/flavour. Theme and palette are attributes on `<html>`:
`data-theme="dark|light"` (omit to follow the system), `data-palette="slate"` (omit for the style's default).
`examples/minimal.html` is a working page.

## 3. React (Vite)

`@avn/ui` is not on npm yet. Two ways to use it:

**a. Alias to the source (simplest while you iterate on both)**

```ts
// vite.config.ts
import { fileURLToPath } from 'node:url';
export default defineConfig({
  resolve: { alias: { '@avn/ui': fileURLToPath(new URL('../AVN-Style/packages/ui/src/index.ts', import.meta.url)) } },
});
```
```jsonc
// tsconfig.json
{ "compilerOptions": { "paths": { "@avn/ui": ["../AVN-Style/packages/ui/src/index.ts"] } } }
```
Install the dependencies the source needs in the app: `motion @radix-ui/react-dialog @radix-ui/react-tooltip`.

**b. Tarball (when the repo should be self-contained)**

```
cd AVN-Style && npm install && npm run build
cd packages/ui && npm pack            # makes avn-ui-0.1.0.tgz
cd ../../../my-app && npm install ../AVN-Style/packages/ui/avn-ui-0.1.0.tgz
```

Then import the CSS once, in this order, and use the components:

```tsx
import '@avn/ui/css/avn-family/fonts.css';
import '@avn/ui/css/avn-family/tokens.css';
import '@avn/ui/css/components.css';
import '@avn/ui/css/avn-family/flavour.css';

import { AppShell, Sidebar, ToastProvider } from '@avn/ui';
```

(`npm run sync-css -w @avn/ui` regenerates `packages/ui/css/` from the sources (every style folder not starting with `_`); `build` does it for you.)
See `packages/ui/README.md` for the component list and `packages/ui/demo/main.tsx` for a full example.

## 4. Switching style or palette

Change the CSS imports (or `<link>`s) to another folder under `styles/`, and set `data-palette`.
No component changes. Allow users to pick a theme with `document.documentElement.dataset.theme = 'light'`.

## 5. Backends

Build the front end to static files and serve them from the backend:

- **FastAPI**: `app.mount("/", StaticFiles(directory="static", html=True))` after your API routes.
- **Node/Express**: `app.use(express.static('dist'))` and a fallback to `index.html` for client routes.

Use a relative `base` (`base: './'` in Vite) if the app is served from a sub-path.

## 6. Next.js or other frameworks

Components are plain React with CSS files. Import the CSS in the root layout. Components that use Motion or Radix are
client components (`'use client'`).

## Troubleshooting

| Symptom | Cause |
|---|---|
| Everything transparent / unstyled | `tokens.css` not loaded, or loaded after `components.css` |
| Light theme looks dark | `color-scheme` overridden; don't set `background` on `html`/`body` outside `--bg` |
| Fonts fall back to system | `fonts.css` not loaded, or fonts blocked by CSP |
| Nav highlight jumps instead of sliding | two copies of `motion`; dedupe in the app |
| Phone layout not appearing | `.app-root` must wrap the shell (layout uses container queries on it, not viewport width) |
| `npm run check-styles` fails | the message lists the missing roles; add them to `tokens.css` |
