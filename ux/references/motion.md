# Motion

Short, meaningful, once. All of it off with `prefers-reduced-motion` (final state at once).

## What moves
| Thing | How |
|---|---|
| Active nav highlight | slides to the new item, ~340 ms, slight overshoot |
| Page change | old content fades out 120 ms; new blocks rise in one after another, 50 ms apart |
| Key numbers | count up once on entering; roll like an odometer when filters change |
| Charts and bars | grow from the baseline once, staggered; lines draw in |
| Groups, menus, drawers | ease open (~300 ms); menus pop in (~200 ms); drawers slide |
| Verified | a springy check and a small pixel burst when Done becomes Verified |
| Toasts | slide up into the bottom slot; others move up smoothly |
| Live things | one slow pulse on the live dot; packets moving along a live pipeline; an error spark blinks |

## What doesn't
- Hover: colour change and a 2 px nudge, nothing bouncing.
- Tables and text never animate after they appear.
- Resizing redraws without replaying animations.
- Nothing loops except live things, and they stop when the data stops.

## Moments
Bigger animations belong to the style's flavour (boot screen, empty-state scenes) and follow these limits: once per event, under 1 s (boot ≤ 1.3 s, once a day), stepped timing for pixel art, at most one scene per screen, only in empty states and celebrations.
