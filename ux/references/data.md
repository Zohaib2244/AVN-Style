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

## Charts
- One scale; every label names a value the axis reaches; label the last point.
- Bars grow from the baseline once; redraw on resize without replaying.
- Highlight only the point that matters (the last day, the worst level) with the accent; other marks use `--bar`.
- Draw at the real width so text stays readable on phones.
- Status colours only for status (thresholds, failures).
