# @avn/ui

React + TypeScript components for AVN dashboards and tools. They render the markup that `ux/assets/components.css`
styles, use only contract roles, and animate with Motion (respecting reduced motion). Any style from `styles/` works.

Not published yet; see [`docs/USING-IN-A-PROJECT.md`](../../docs/USING-IN-A-PROJECT.md) for how to consume it.

```tsx
import '@avn/ui/css/avn-family/fonts.css';
import '@avn/ui/css/avn-family/tokens.css';
import '@avn/ui/css/components.css';
import { AppShell, Sidebar, SidebarNav, ToastProvider, useToast, Button } from '@avn/ui';

function Save() {
  const toast = useToast();
  return <Button onClick={() => toast({ kind: 'ok', title: 'Saved' })}>Save</Button>;
}
```

The best worked example is [`demo/main.tsx`](demo/main.tsx) (`npm run demo` from the repo root → http://localhost:5199).

## What's in it

| File | Exports |
|---|---|
| `shell.tsx` | `AppShell` `Sidebar` `SidebarNav` (sliding highlight) `Brand` `GameSwitcher` `AccountMenu` `Workspace` `TopBar` `SearchButton` `IconButton` `PageHead` `Page` `TabBar` `MoreSheet` `CommandPalette` (`scoreCommand`, `filterCommands`) |
| `primitives.tsx` | `Tag` `Count` `Button` `Segmented` `Delta` / `formatDelta` `Sparkline` `RollingNumber` `Kpi` `Panel` `EmptyState` `STATUS_MEANING` |
| `feedback.tsx` | `Skeleton` `PageSkeleton` `LoadBar` `StatusLine` `ErrorPanel` `Banner` `Freshness` `ToastProvider` / `useToast` (`stackToast`, `TOAST_MS`, `MAX_TOASTS`) `NotificationList` `BellButton` |
| `overlays.tsx` | `Drawer` `DialogShell` `ConfirmDelete` (typed name) `ShortcutsDialog` `Definition` `DefinitionGroup` (warm tooltips) `Popover` `MultiSelect` `SingleSelect` `Calendar` (`CalendarRange`, `pickDay`, `monthGrid`) |
| `rules.tsx` | condition model (`matchesEvent`, `conditionError`, `updateNode`) `ConditionSentence` `RuleSentence` `RuleBar` `ConditionEditor` `RulePreview` `HighlightsBar` `Timeline` |
| `data.tsx` | `BarChart` `SurvivalCurve` `HeatStrip` `FunnelHeadline` `FunnelResult` (`timingText`, `duration`, `SEGMENT_COLOURS`) `OptionChip` `CompareTable` (`compareSummary`, `dropChange`, `dropToNext`, `steepest`, `biggestDrop`) `useWidth` |
| `cards.tsx` | `GameCard` `GamesGrid` `InsightCard` `Insights` `Kpis` `SectionLabel` `SectionTile` `Tiles` `NeedsALook` `SetupChecklist` `StatusStrip` `Pipeline` `FilterBar` |
| `assistant.tsx` | `NutBotPanel` `PromptBar` (`parseToken`) `ThoughtLine` `ToolCallChip` `ToolTrace` `Block` (table, checklist, chart, custom, proposal) |
| `marks.tsx` | `StatusMark` `Bits` `SpringCheck` `Lattice` (`LATTICE_PATTERNS`, `fmtElapsed`) `Heartbeat` `RollingText` `BranchList` `useRect` |
| `flows.tsx` | `CodeSlots` (`insertDigits`, `digitsOf`) `Stepper` `Step` |
| `pixel-field.tsx` | `PixelField` (`roleColour`) |
| `regions.tsx` | `QueryRegion` (skeleton → error with Try again → content; "Updating… Showing previous results." while refetching with data) `SkeletonBlock` (stats / table rows×columns / chart) `errorText` `QueryLike` |
| `forms.tsx` | `useSubmit` (one submit in flight; values + form element to the handler; thrown errors land in `error`) `FormError` (the form's `role="alert"` line) `Field` (label + control + hint/error) `formValues` |
| `disclosure.tsx` | `RememberedDetails` (`rememberedOpen`, `rememberOpen`) `CollapsiblePanel` (`useCollapsed`) |
| `activity.tsx` | `DailyTable` (`fillDays`, `prettyDay`) `TrendLine` (`trendPoints`) |
| `daterange.tsx` | `DateRange` (compact or full; presets, From–To days, ‹ › steps, calendar) `PRESETS` `resolveRange` `rangeText` `shiftRange` `presetLabel` ISO day helpers (`todayISO`, `addDays`, `daysBetween`, `dayToDate`, `dateToDay`, `shortDay`) |
| `pixel-icon.tsx` | `PixelIcon` `pixelIconSVG` `PIXEL_ICONS` `ICON_COLORS` |
| `icons.tsx` | `Icon` (line icons by name) |
| `context.tsx` | `AppContainerProvider` `useAppContainer` `useAppElement` (so portals render inside the container the layout queries) |
| `cx.ts` | `cx` `fmt` `secs` `relativeTime` `niceStep` |

Props are typed; your editor is the reference. Read the component's test in `test/` for the intended usage.

## Rules for contributing

- Component markup and class names follow `ux/assets/components.css`. Add the CSS first; the `css-contract` test fails if a class is missing.
- No colours, fonts or radii in components. Use roles from `contract.md` through CSS.
- Every interactive component: keyboard path, focus visible, accessible name, reduced-motion safe.
- Add a test for behaviour (not for markup shape). Run `npm run check` from the repo root.

## Scripts (run from `packages/ui` or with `-w @avn/ui`)

`sync-css` · `typecheck` · `test` · `build` · `check` (all of those) · `demo`
