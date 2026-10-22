# Components

All classes are in `../assets/components.css`.

## Buttons and controls
- `.btn` default, `.btn.primary` the one main action of an area, `.btn.ghost` low-emphasis, `.btn.sm`, `.btn.danger` (filled, permanent actions only), `.btn.danger-o` (outline).
- Busy button: spinner replaces the icon, label says what's happening ("Preparing…"), disabled, keeps its width (`aria-busy="true"`).
- `.seg` segmented control for 2–4 options. More than 4 or long lists → single-select picker.
- `.select` field button that opens a picker.

## Tags and status kinds
`.tag` + kind. Always a word.

| Kind | Class | Example |
|---|---|---|
| Verified | `.tag.ok` | Verified, Healthy, Live |
| Done | `.tag.done` | Done · to confirm |
| Info | `.tag.info` | Syncing, Waiting |
| New | `.tag.new` | Beta |
| Warning | `.tag.warn` | Needs a look |
| Failed | `.tag.bad` | Failed, Missing, Rejected |
| Current | `.tag.accent` | Current |
| Inactive | `.tag.plain` | Quiet, Replay, To do |

Weights: soft (default), `.o` outline (inside dense tables), `.dot` (next to a name). At most two kinds in one row. **Verified is only ever set by a check, never by hand.** Done → Verified is the two-step for anything that can finish without being confirmed (SDK added → first event; backup ran → test restore).

Counts: `.cnt`, `.cnt.warn`, `.cnt.bad`, `.cnt.info`.

## Key number (KPI)
`.kpi`: label (with a definition if it has one) → number in the display font → one context line with a coloured change (`.d.up` / `.d.down`). Optional sparkline top-right. Numbers count up once on entering a page and **roll like an odometer** when filters change.

## Change cell
`↓ −20.6 pp · less drop`: arrow = direction, colour = good or bad (less drop is good even though the number fell), words say it again. Under 0.5 pp reads "unchanged" in neutral. Class `.delta.good` / `.delta.bad`.

## Panels
`.panel` → `.ph` (title, one line under it, actions + freshness stamp on the right) → `.pb` body or a table. Don't nest panels.

## "Needs a look" list
`.look` rows: kind tag, one-line problem with one detail line, one action. When empty, show the style's "all clear" scene.

## Game status card
Icon, name, package, a Live/Quiet tag; platform pills with totals (dashed "+ iOS" invites the missing one); today's DAU vs yesterday; footer with total events and last event time and an arrow that nudges on hover. The whole card is one link.

## Inspector drawer
Opens from the right over the page (bottom sheet on phone): header (title, sub line, ‹ › to step through neighbours, ×), body (mini KPIs, a small funnel, comparisons, related list), footer actions. Back arrow when one drawer leads to another. Esc closes. When NutBot is open, the drawer slides left to sit next to it.

## Dialog
Only for decisions that block: typed confirmation for permanent actions, shortcuts list. Never for information.

## Empty states
Small picture from the style (block pile, Dora, …), one-line title, one sentence, one action. An empty table says how to get data into it.
