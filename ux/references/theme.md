# Day and night

Every app has a theme switch. Every style gives every palette both a **Day** and a **Night** look (a role set via
`light-dark(day, night)`), designed for that palette, not inverted.

## Rules

1. Three choices, in this order: **Day · Night · System**. Default is **System** (follows the device).
2. Where: the full segmented switch (`ThemeSwitch`) in Settings / the account menu. One icon button (`ThemeSwitch variant="button"`) in the top bar; on phone it goes in the More sheet. The button says what it shows and what the next press does.
3. The choice is saved per device and applied **before first paint** (blocking script in `<head>`, `themeInitScript`), so a Night user never sees a white flash.
4. Mechanism: `data-theme="light|dark"` on `<html>` (absent = System). Palette is separate: `data-palette`. Day/Night and palette combine freely.
5. Switching fades colours for 250 ms (`.theme-switching`); no fade under reduced motion.
6. Never build a component with a day-only or night-only colour. Never hard-code a colour. Charts, status tags and highlights use roles, so they follow.
7. Check every screen in both. Contrast targets hold in both (muted ≥ 7:1, dim ≥ 4.5:1 on panels).
8. Set `<meta name="color-scheme" content="light dark">` and update `theme-color` to `--bg` when the theme changes if the app is installed as a PWA.

## React

```tsx
const [theme, setTheme] = useTheme();           // reads, applies, saves
<ThemeSwitch theme={theme} onChange={setTheme} />                 // settings
<ThemeSwitch variant="button" theme={theme} onChange={setTheme} /> // top bar
```
```html
<script>/* paste themeInitScript here */</script>
```

Without React: set `document.documentElement.dataset.theme = 'light' | 'dark'` (or remove it for System) and save it in
`localStorage['avn-theme']` as `day` / `night`.

See all palettes in both: `board/day-night.html` (rebuild with `npx vite-node scripts/build-day-night.tsx`).
