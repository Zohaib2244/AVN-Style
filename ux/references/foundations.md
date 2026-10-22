# Foundations (any web app)

## Words
- Write from the person's side: "notifications", not "webhook config".
- Buttons say exactly what happens ("Save funnel"), and the toast confirms it ("Funnel saved").
- Errors: what happened, whether data is safe, what to do next. Never "Something went wrong".
- Plain, short sentences. No jargon the person didn't use first.
- Units after numbers; percentage-point changes are "pp".
- Dates: relative for recent ("2 min ago") with the exact time on hover; show the time zone when it matters.

## Accessibility
- Visible focus on everything interactive; logical tab order.
- Labels on every control; icons-only buttons get `aria-label`.
- Contrast from the contract (muted ≥ 7:1, dim ≥ 4.5:1 on panels) in both themes.
- Status never by colour alone: always a word, an icon or a shape too.
- Live regions: toasts announce politely, errors immediately.
- Keyboard: no single-letter shortcuts (they fire while typing); chords only (Ctrl/Cmd + key).
- `prefers-reduced-motion`: no movement, final state immediately.

## Responsive
Breakpoints are measured on the **app container**, not the screen (`.app-root`
is the container), so the tool also works in a narrow window.

| Width | Navigation | Layout |
|---|---|---|
| over 900 px | full sidebar (≈232 px), grouped | 4 key numbers across, panels side by side |
| 620–900 px | icon rail (≈62 px), names as tooltips, groups become dividers | panels stacked |
| under 620 px | bottom tab bar (4 pages + More sheet) | numbers 2 × 2, filters one scrolling row, drawers become bottom sheets |

- Tables: on phones hide lower-priority columns, or scroll sideways with the first column pinned. Don't hide data that is the point of the table.
- Touch targets at least 44 px on phones.

## Density
- Two densities: **Roomy** (reading) and **Compact** (comparing, ~28 px rows). Remember the person's choice.
- Dense, not airy: small gaps (8–16 px), but never cramped text.
