# Data

## Give the data the room
- Data pages have **no max width**. Only paragraphs are capped (~65 characters).
- Data starts on the first screen. Explanations become a one-line footnote (`.foot-note`) or a definition tooltip, never paragraphs above the table.
- One toolbar line; it wraps, it doesn't stack.
- The table uses the height: sticky headers, scroll inside the data only, ~20 rows visible on a laptop in Compact.
- Summarise above, detail below: a `.sumstrip` like "10 worse · 1 better · 15 unchanged" before the table.

## Say each thing once
- Combine value and count in one cell: `14.3% · 1`.
- Don't repeat words per row: a marker (◦ = small sample) plus one legend line.
- Group columns under spanning headers (`0.1.2 · A` | `0.1.3 · B`); pin the first column when scrolling sideways.
- Tint only what matters (e.g. changes ≥ 5 pp); everything else neutral.
- Numbers right-aligned, monospaced, tabular.

## Compare view (`.cmp`)
For "A vs B" (releases, platforms, cohorts): one-line selectors in the panel header (A ▾ vs B ▾ · Compare), summary strip, grouped table with the change cell as the last column, footnote with units and caveats ("observed behaviour, not proof a release caused a change").

- **Name the baseline**: the baseline group's header says "baseline" and the change column says which way it reads ("Drop change · B vs A"), because "less drop" means nothing without saying less than what (`CompareTable` `baseline`).
- The footnote under the table carries units and caveats ("pp = percentage points", "observed behaviour, not proof…"); apps replace it with their own (`footnote`), never add a paragraph above the table.

## Level-by-level: curve + heat strip + table
1. **Players remaining** curve (line + soft area), the two steepest drops marked and labelled; each point opens the level drawer.
2. **Heat strip**: one cell per level, colour by drop to next; click opens the drawer.
3. **Table** with exact numbers; rows open the drawer.

## Funnel
- **Headline first**: one big conversion number in a sentence ("61.9% of players who opened the game finished level 5"), then started / finished / median time.
- **Steps** are a numbered list of sentences (`event where param = value`).
- **Options are chips**, always visible, highlighted when changed from the default (count per player/session, finish within, break down by). No collapsed "Options" section.
- **Result rows**: step label and count on one line, a full-width bar under it (width ∝ share of step 1); breakdown splits each bar by segment with a legend.
- Between rows: players lost, share and median time to the next step, with "See who" (opens a drawer of those players). The biggest drop is marked.

- Between rows, the time to the next step is one phrase, the median ("median 12s to the next step"); the average, fastest, slowest, 90th percentile and player count live in the hover and in screen-reader text, so the line stays one line and the median is the number people act on (`times`).
- Under a drop, "Stopped here:" lists a few example players (short id, when last seen) with "n of lost" when it is a sample; the app supplies the link or the open action, the component never routes (`stopped`, `onOpenPlayer`, `renderLink`).
- The biggest drop is the only drop marked, in words ("biggest drop") and with `data-worst`, so an app can style or scroll to it without parsing the text.
- Breakdown bars split per segment in legend order; the first segment uses the neutral bar colour and the rest the highlight roles, so two-segment and N-segment funnels read the same way (`segmentsOf` + `shares`).

## Charts
- One scale; every label names a value the axis reaches; label the last point.
- Bars grow from the baseline once; redraw on resize without replaying.
- Highlight only the point that matters (the last day, the worst level) with the accent; other marks use `--bar`.
- Draw at the real width so text stays readable on phones.
- Status colours only for status (thresholds, failures).

## Per-day table
`DailyTable`: the total first ("1,500 events · Mon, Oct 20 → Thu, Oct 23 · 4 days"), then one row per day of the range with missing days filled in as 0 and a bar relative to the busiest day (a `<progress>` whose column header is visually hidden), so gaps are visible as gaps and the busiest day reads at a glance. A total of 0 shows the empty state ("No events in this range."), never an empty table. `TrendLine` is the sparkline for table rows: the scale starts at 0 and the last point is marked, so two rows compare; `Sparkline` (min→max) is only for a single KPI's corner.
