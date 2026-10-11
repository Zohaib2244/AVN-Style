# Porting

1. Copy `assets/tokens.css` and `assets/base.css` into the project.
2. **Tailwind projects:** keep these files as *plain CSS imported separately*. Do not put them in a file that also contains `@import "tailwindcss"`, `@theme` or `@apply` — in AVN Hub that routed 2,800 lines through `@tailwindcss/postcss`, whose per-file cache served stale CSS after edits.
3. **Fonts:** Next.js → `next/font/google` (`DotGothic16` weight 400, `JetBrains_Mono`) with variables `--font-dot-gothic` / `--font-jetbrains-mono`, applied on `<html>`. Otherwise include `assets/fonts-standalone.css`.
4. **Theme:** set `data-theme` / `data-palette` on `<html>` before paint with a tiny inline script reading localStorage, to avoid a flash of the wrong theme.
5. **New palette:** add `[data-palette="x"]` and `[data-palette="x"][data-theme="light"]` blocks with all 14 tokens and verify the contrast contract (`tokens.md`).
6. Check dark and light, and a narrow viewport.
