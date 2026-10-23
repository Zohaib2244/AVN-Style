# Components

All classes are in `../assets/components.css`.

## Buttons and controls
- `.btn` default, `.btn.primary` the one main action of an area, `.btn.ghost` low-emphasis, `.btn.sm`, `.btn.danger` (filled, permanent actions only), `.btn.danger-o` (outline).
- Busy button: spinner replaces the icon, label says what's happening ("Preparing…"), disabled, keeps its width (`aria-busy="true"`).
- `.seg` segmented control for 2–4 options. One **rubber thumb** sits behind the current option; on click it stretches toward the new option and lands with a small squash (`--ease-spring`). ← → move it by keyboard (no stretch). More than 4 or long lists → single-select picker.
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

## Status mark
`.smark` with `data-state`: one 20 px glyph for the status vocabulary, used wherever a row has a state (setup checklist, pipeline steps, NutBot checklists and tool calls).

| State | Looks | Means |
|---|---|---|
| `todo` | dashed ring | not started |
| `wait` | spinning arc, or a filling arc when progress is known (`--p`) | running, waiting on something |
| `done` | ring fills, the check draws in, Done colour | finished, not confirmed |
| `ok` | the same, Verified colour, then a pixel burst | confirmed by a check |
| `bad` | the cross draws in, Failed colour | broken |

The mark **morphs** between states instead of swapping icons. With a label (`.smark b`), Verified also strikes the label through when the row is a task. Always paired with a word (a tag or the label).

## Spring check
`.schk`: a checkbox row for tasks a person ticks by hand (team invited, read the guide, a NutBot checklist a person confirms). Box fills from the centre with a spring, the tick draws, the label dims and is struck through. `role="checkbox"`, Space toggles. Not for Verified: Verified is only ever set by a check, so a spring check never produces the Verified kind.

## Stepper (setup flows)
`.stepper`: the setup-flow pattern as one component. A track of step tiles (number → check when complete) with a **glider** behind the current tile; one pane at a time; footer with Back and Continue (Complete on the last step). Panes slide in the direction of travel. Steps can be clicked when reached (`linear` keeps future steps closed). Vertical rail with titles and one-line descriptions when there is room; dots or bars when there is not. Never more than one decision per step.

## Code slots
`.slots`: entry for short numeric codes (pairing a device, confirming an API key fingerprint). One hidden input, one box per digit, a caret in the active box. Typing lands a digit with a spring, paste cascades, Backspace steps back, ← → Home End move. `status="error"` drains the digits out and the row tints Failed; `status="success"` washes the row with the accent and shows one check, then the input is read-only. The screen reader hears "3 of 6 digits entered" and "Code accepted".

## Heartbeat
`.beat`: a live dot that **beats** when something arrives (a packet, an event) and rests with a slow glow in between. Optional count next to it rolls like an odometer. Replaces the plain pulse wherever a live count exists (status strip, server status). The sidebar live dot keeps the slow pulse.

## Branch list
`.branch`: a list of children hanging off a trunk with rounded branch lines; the current child's branch is drawn in the accent (the line draws in). For nested things that have one current item: steps under a thought line, condition groups in the rule editor, related items in a drawer. Collapsible with the same grid-rows fold as sidebar groups.

## Pixel field
`.pxfield`: a canvas of faint pixels behind a card. Ambient (twinkle at ≤ 8 % opacity), brighter under the pointer, a one-off burst on a celebration. Colours come from the roles (`--text`, `--accent`, `--ok`) read at runtime, so any style works. Only on empty states, the dashed "Register a game" card, and the Verified moment. Never behind data.
