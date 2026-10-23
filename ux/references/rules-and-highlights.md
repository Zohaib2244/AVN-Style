# Rules and highlights

People filter players ("players who did X") and mark events in a timeline. Both
use the same condition vocabulary: `field (event name | parameter) · operator
(= ≠ contains > ≥ < ≤ exists missing) · value`, combined in groups that match
**all (AND)** or **any (OR)**, nested up to three deep.

## Rule bar (applied rules)
A tinted bar **above** the data, never inside a collapsed section:
- Header: filter icon, "Showing players who", the **match count** ("65 of 260 players"), Clear rules (with Undo).
- Each rule is a row that reads as a **sentence of tokens**: `did` `level_start` where `level` = `12` (verb token tinted; `didn't do` uses the failed kind).
- Between rules a visible **AND/OR button** with a short explanation ("players match every rule").
- Edit and remove on each row (remove shows Undo); a dashed full-width "+ Add rule".
- No rules: a compact bar "All 260 players" with one-click presets ("Reached level 10", "Never purchased", "Plays on iOS").

## Rule editor (drawer)
Opens in the drawer, not inline:
- Rules: "Players who [did | didn't do] [event ▾]". Highlights: name and colour swatches.
- Condition groups are blocks with a coloured left edge by depth and an explicit **Match all / any** switch; "+ Condition", "+ Group", "Remove group".
- "How often: at least N times" for did-rules.
- **Reads as**: the rule repeated as a sentence.
- **Live preview**: matching players or events, updated as you type, or the first problem in plain words ("Fill in a value").
- Footer: Remove (existing), Cancel, Apply / Save.

## Highlights in a timeline
- A **highlights bar** above the timeline: one chip per highlight (colour dot, name, match count, eye to turn it off, edit), "+ Highlight", quick presets (Screens, Purchases, Fails).
- Mode: **Highlight** (mark matches) or **Only matches** (filter).
- A **map** of where matches fall (start → latest), each tick a button; **Previous / Next** with "3 / 17 matches". No single-letter shortcuts.
- Matching rows get a coloured left edge, a soft tint and a tag with the highlight's name; the current match is outlined.
- Highlight colours are the six contract slots (`--hl-*`).
