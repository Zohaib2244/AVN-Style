# Pickers

All three share one popover (`.pop`). Desktop/tablet: opens under its control, at most 460 px tall, scrolls inside. Phone: bottom sheet with 44–46 px rows. Esc or an outside tap closes. Every row is a button (keyboard works).

## Multi-select list (Filters)
- Categories with a label and a thin rule (`.pop-grp`).
- Checkbox left, count right (`.opt` with `.cb` and `.oc`).
- The common default sits on top as a toggle ("Hide editor & development data").
- Applied values become **chips** under the filter bar, one per category, each removable (removal shows Undo).
- Footer: Clear + Done.

## Single-select list (range preset, sort, platform)
- Same rows, no checkboxes; a tick marks the current option and its text goes bold.
- One **pill** (`.pop-pill`) glides between rows under the pointer and the arrow keys; it remembers its row when the pointer leaves. Pressing and dragging over the rows scrubs the pill; releasing picks.
- The field button's label swaps with a tiny upward slide when the value changes.
- Type a letter to jump to the next option starting with it.
- The right slot holds a hint instead of a count (e.g. the date span).
- Picking applies and closes. "Custom range…" opens the calendar.

## Date range (calendar)
- Opens from the date field or "Custom range".
- Two taps: start, then end; applies on the second.
- Range filled softly, ends solid, today ringed; Monday first; other months dimmed; arrows move by month.
