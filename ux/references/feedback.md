# Feedback: loading, errors, toasts

## Loading
| Wait | Show |
|---|---|
| under 300 ms | nothing (a flash of skeleton is worse) |
| 300 ms – 1 s | skeleton shaped like the content, so nothing jumps |
| over 1 s | skeleton + one **status line**: spinner, what's happening, seconds elapsed |
| over 10 s | the line says it's taking longer than usual and offers Retry. Never spin forever. |

- Refreshing data already on screen: keep it visible, say "Refreshing…" in the header. Never blank a page that has data.
- Spinners for buttons; the **lattice** (`.lattice`, a 3 × 3 pixel grid lighting cells in a pattern) for status lines, panel headers and NutBot thinking: it says how long so far and turns into a check or a cross when the wait ends ("Done in 2.3 s", "Failed after 8.1 s"); skeletons for content; pixel-block bar for known-length work (exports).

## Errors: where they go
| What failed | Where | How long |
|---|---|---|
| a field's input | under the field, saying how to fix it | until fixed |
| a button action (save, export, copy) | error toast with Retry | until dismissed |
| one panel's data | inside that panel with Try again; the rest works | until retried |
| the whole page | page error with Try again and Back; technical details folded | until retried |
| connection lost | banner with last-updated time; retries by itself | until back |
| no access | page saying why and who to ask | — |

One failure, one message: inline or toast, not both. Keep stale data on screen under a banner when you have it.

## Toasts
- Bottom right (full width on phones). The **newest takes the bottom slot**; older ones slide up.
- At most 4; a fifth pushes out the oldest non-error.
- Success and info fade after 5 s, warnings 8 s, errors stay until dismissed. A thin line shows time left. Hover or focus pauses.
- Always a dismiss button. At most one action, a verb (Retry, Download, Undo).
- The same message twice becomes one toast with ×2 and a fresh timer.
- For results of what the person just did, or news from outside. Not for things already visible.

## Notifications
Every toast is also kept in the **bell** (last 50) with time and kind; the bell shows an unread count, opening marks all read, "Clear all".

## Undo vs confirm
- Reversible (remove a filter or rule, archive a game, delete a highlight): **act immediately**, toast with Undo.
- Permanent (delete all data): dialog listing exactly what's lost; the confirm button stays disabled until the person **types the name**.
- Never "Are you sure?" for reversible actions.

## Freshness
Each data panel shows "Updated 2 min ago" with a refresh icon (spins while refreshing). The top bar's refresh menu has "Refresh now" and **auto-refresh** (off / 1 / 5 / 15 min); when on, a small badge shows the interval.
