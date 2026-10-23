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
- **Presets** (Today, Yesterday, Last 7/30/90 days, This month, Last month) sit in a single-select list with the date span as the hint, so the person sees the days before committing; "Custom range…" is the last row and opens the calendar (`DateRange`).
- **Compact row** for filter bars: preset menu · ‹ · the days (opens the calendar) · ›, one line so the range never pushes the other filters down.
- **Stepping**: ‹ › move the range by its own length (a 7-day range steps a week, a month steps a month) and turn it into a custom range, because "the same window, one period earlier" is the comparison people ask for.
- **Full variant** (settings, forms): every preset is a pressed button in a wrapping row above the days, so the choice is visible without opening anything.
- Applied filters are chips under the bar (`FilterBar`); the chip only removes, the app offers Undo in the toast.
