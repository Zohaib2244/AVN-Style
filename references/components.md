# Components (classes in `assets/base.css`)

| Class | What |
|---|---|
| `.frame` | outer bezel: 22px radius, 1.5px border, 4px hard shadow |
| `.block` | sticker card: 12px radius, 1.5px border, 3px hard shadow; hover → accent border + 5px shadow |
| `.block.accent-left` | 3px accent left border |
| `.block-label` | uppercase DotGothic label (muted-dim) |
| `.block-value` (`.accent`/`.teal`) | primary data value |
| `.block-sub` | sub text |
| `.block-stat` (`.accent`) | headline number |
| `.seg-row` / `.seg-btn(.active)` | segmented options |
| `.wset-select` / `.wset-input` | form controls on `--bg-nested` |
| `.wset-section` | in-panel section header with top rule |
| `.hub-dialog*` | confirmation modal |
| `.theme-toggle` | 22px round mode toggle |
| `.btn`, `.btn-primary`, `.btn-danger` | extras: buttons |
| `.status-dot(.up/.down/.busy)`, `.pill` | extras: status |
| `.console` | extras: log/terminal well |

## Interaction pattern
Resting state is `--text-muted` + `--border`. Hover/active moves to `--accent-orange`
(colour and border). Filled-active states use `--accent-orange` background with `--badge-text`.

## Destructive actions
Always through a `.hub-dialog` confirm — never a single click.
