# App shell

```
.app-root (size container)
└ .app  ── .side (sidebar) │ .workspace ── .topbar
                           │             └ .content (page)
        └ .tabbar (phone) · .drawer · .nb (NutBot) · .pop · .dlg · .cmdk
```

## Sidebar
- Top: logo (the style's icon) → **game switcher** (icon, name, package; opens a list) → platform switch.
- Nav items grouped under small labels: **Analyze** (Overview, Funnels, Levels, Players), **Data** (Exports, Event dictionary, Event setup, Data health), **Manage** (API keys, Game settings, collapsible, closed by default).
- **One sliding highlight**: a single pill behind the active item that slides to the new item (~340 ms). Active item: bold text, accent icon, accent edge on the pill.
- Counts appear **only** when something needs a look (`.cnt.warn`); live things show a small pulsing dot. No status line under every item.
- Account and admin pages (Workspaces, Team, Server status, Settings) live in the **account menu** at the bottom, not the main list.
- Tablet: icon rail, names as tooltips, group labels become thin dividers, collapsed groups open.

## Top bar
- Left: breadcrumbs (`Games / Game / Page`; "Games" links home). Phone: logo + page name.
- Right: search button (opens the command palette, shows `Ctrl K`), refresh (refresh now + auto-refresh), copy link, notifications bell (unread count), NutBot.

## Page head and filter bar
- Page head: display-font title (≈28 px), one sentence under it, the page's main action on the right.
- **Filter bar** under it, the same on every data page, one line that wraps: range preset · date field · Local/UTC · page-specific segmented control · Filters (with count) · applied filter chips · note ("Editor and development data hidden") · density (Roomy/Compact).
- Phone: the filter bar is one sideways-scrolling row.

## Phone
- Bottom tab bar: four main pages for that app + **More** (bottom sheet with the rest and the account items). A small accent bar slides to the active tab.
- Each app picks its own four (Analytics: Overview, Levels, Players, Data health; PlayLens: Logs, Performance, Plugin health, Checklist).
