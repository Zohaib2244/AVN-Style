# Typography

Root `html { font-size: 17px }`. Two families:

| Family | Used for |
|---|---|
| **DotGothic16** | section/field labels (uppercase, `letter-spacing: 0.14em`), headline stats, widget titles, button text |
| **JetBrains Mono** | primary values, sub text, prose, chips/pills/badges |

## Five-step scale (each ≥ 1.15× the last, floored at ~11px)
| Token | rem | px @17 | Use |
|---|---|---|---|
| `--fs-micro` | 0.65 | 11.1 | badges, pills, counts, micro-labels |
| `--fs-label` | 0.75 | 12.8 | section/field labels, dense rows |
| `--fs-body` | 0.875 | 14.9 | sentences, inputs, settings rows |
| `--fs-lead` | 1.2 | 20.4 | titles, primary data values |
| `--fs-stat` | 2.2 | 37.4 | headline stat numbers (`line-height: 1`) |

DotGothic16 is a bitmap-grid face and drops strokes below ~11px, hence the floor.
Size alone can't carry hierarchy at these sizes — pair the step with **family and colour**.

Never: Inter, Roboto, Arial, system fonts.
