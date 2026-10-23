# Motion

Short, meaningful, mostly once. All of it off with `prefers-reduced-motion` (final state at once).

## Two budgets
| Budget | What | Rule |
|---|---|---|
| **Moments** | something happened: a step verified, a code landed, a tool finished, a page opened | plays once, under 1 s, then stops |
| **Ambient life** | something is alive or waiting: a live dot, a loader, an empty state, the add-a-game card | may loop, but quiet: small, slow, low contrast, never on data, at most **one ambient thing per view**, stops when the data stops |

Ambient life is allowed since 0.2.0. It must never be on a table, a number, a chart or text, and it never competes with a moment: when a moment plays, nearby ambient motion pauses or is far enough away not to matter.

## What moves
| Thing | How |
|---|---|
| Active nav highlight | slides to the new item, ~340 ms, slight overshoot |
| Segmented control | the thumb stretches toward the new option, then lands with a small squash (`--ease-spring`); keyboard moves jump |
| Single-select picker | one pill glides between rows under the pointer or arrow keys; the picked label swaps with a tiny upward slide |
| Page change | old content fades out 120 ms; new blocks rise in one after another, 50 ms apart |
| Key numbers | count up once on entering; roll like an odometer when filters change |
| Charts and bars | grow from the baseline once, staggered; lines draw in |
| Groups, menus, drawers | ease open (~300 ms); menus pop in (~200 ms); drawers slide |
| Status marks | one glyph morphs: dashed ring (to do) → spinning arc (waiting) → the check draws in (Done, Verified) or the cross draws in (Failed); a strike-through follows a Verified label when the row is a task |
| Spring checks | the box fills from the centre with a spring, the tick draws, the label dims and is struck through |
| Verified | the mark draws, then a small pixel burst; Done → Verified is the only moment that uses the burst |
| Code slots | each digit lands with a spring; a pasted code cascades in 20 ms apart; a wrong code drains out slot by slot; a right one is washed with the accent and shows one check |
| Stepper | the tile glides to the current step; panes slide 36 px in the direction of travel and the frame height eases |
| Tool calls (NutBot) | a chip fills left to right while running, washes with Verified when done, shakes 6 px and offers Retry when it fails; its icon rolls to a check or a retry glyph |
| Thinking (NutBot) | the "Thinking…" line shimmers and breathes while working, then settles (blur out, blur in) to "Thought for 2.3 s" with the steps folded under it |
| Send button (NutBot) | the arrow morphs into a stop square while NutBot works; pressing it stops |
| Toasts | slide up into the bottom slot; others move up smoothly |
| Definitions | the first tooltip waits ~400 ms (a thin fuse line under the term shows the wait); while a tooltip is warm, neighbours open at once and the bubble glides to the new term |
| Heartbeat | the live dot beats twice when a packet arrives (the count rolls), and rests with a slow glow in between |
| Live things | one slow pulse on the live dot; packets moving along a live pipeline; an error spark blinks |

## Ambient life (allowed loops)
| Thing | How | Where |
|---|---|---|
| Lattice loader | a 3 × 3 pixel grid lights cells in a pattern (orbit, snake, pulse) while waiting; becomes a check or a cross when it ends | status lines, NutBot thinking, a busy panel header |
| Pixel field | faint pixels twinkle behind a card at ≤ 8 % opacity; brighten under the pointer; burst once on a celebration | empty states, the "Register a game" card, the Verified moment |
| Heartbeat | the live dot glows slowly between beats | sidebar live dot, status strips, server status |
| Scenes | Dora breathes, packets travel, stars twinkle | empty states only, one per screen |

## What doesn't
- Hover: colour change and a 2 px nudge, nothing bouncing.
- Tables and text never animate after they appear.
- Resizing redraws without replaying animations.
- Nothing else loops; ambient things stop when the data stops or the view is hidden.

## Moments
Bigger animations belong to the style's flavour (boot screen, empty-state scenes) and follow these limits: once per event, under 1 s (boot ≤ 1.3 s, once a day), stepped timing for pixel art, at most one scene per screen, only in empty states and celebrations.

## Lineage
Several of these were adapted from React Bits (reactbits.dev): SpringCheck, StatusMark, CallChip, ThoughtLine, LatticeLoader, RubberSegment, GlideSelect, CodeSlots, Stepper, PromptBar, PulseHeart, WarmTooltip, BranchedMenu, PixelCard. They are rewritten onto the contract roles with Motion only (no extra dependencies), and each one has a job here; none is decoration.
