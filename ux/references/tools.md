# Tools

## Command palette (Ctrl/Cmd + K)
- Opens from the top-bar search button or the chord. Groups: **Pages**, **Games**, **Actions**; typing filters (prefix > contains > subsequence) and highlights the match.
- If text is typed, the first item is **Ask NutBot: "…"**.
- ↑ ↓ to move, Enter to run, Esc to close. Phone: opens at the top, full width.

## Copy link to this view
The link button copies a URL that reopens exactly this view: page, range, filters, compare selection, density. The URL updates as state changes so back/forward work.

## Definitions
Labels with a dotted underline explain how a number is counted, on hover and keyboard focus (tap on phones). One sentence plus an optional source ("Missing next-level data is not counted as a drop"). Definitions come from the event dictionary where possible.

Tooltips are **warm**: the first one waits ~400 ms (a thin fuse line under the term shows the wait filling), and while one is open or just closed, neighbouring terms open at once and the bubble glides to the new term instead of popping again. Press and hold opens on touch. A page wraps its definitions in one `DefinitionGroup` so they share warmth.

## Pairing and codes
Short numeric codes (pairing a device to PlayLens, confirming a key fingerprint) use **code slots** (`components.md`), never a plain text field: one box per digit, paste works, a wrong code drains out and says why, a right one shows one check and locks.

## Keyboard shortcuts (Ctrl/Cmd + /)
A dialog listing every chord with keycaps: Ctrl K search, Ctrl J NutBot, Ctrl / this list, Esc close, ↑ ↓ Enter in lists, Enter inspects a focused row. No single-letter shortcuts.

## Setup checklist
Each new game (or device, or project) gets the steps that make its data trustworthy, using Done → Verified:
SDK added → API key in use → dictionary filled (Done until checked) → first funnel saved → new release seen → team invited. Each row: status icon, title, one line, tag, one action. Collapsible; disappears once every step is verified. "Check now" turns Done into Verified with a small burst.
