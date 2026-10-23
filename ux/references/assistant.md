# Assistant (NutBot)

One assistant pattern for every AVN tool. Each app gives it **that app's tools**;
it answers with **that app's components**. The look comes from the style.

## Where it lives
- A panel on the right (`.nb`, ≈420 px); the page stays usable beside it. An open drawer slides left to sit next to it. Phone: bottom sheet.
- Opens from the NutBot button, **Ctrl/Cmd + J**, or "Ask NutBot" in the command palette.
- Composer: Enter sends, Shift + Enter new line. New-conversation button. Conversations are kept per game.

## Context
- A **"Looking at"** row of chips: game, page, range, version/filters, and the open player or session. Each (except the game) can be left out with × and put back with +.
- The app sends this context with every message (Analytics already sends page, range, filters, player, funnel draft).
- Suggested questions change with the page and with what's open.
- If a question needs something that isn't open ("this player"), NutBot **asks back** with a pick list, then opens it and answers.

## Show the work
- Each tool call appears as it runs: name, inputs, spinner → check. Afterwards it folds to "Used 2 tools" and can be reopened.
- Every number links back to where it came from ("Open timeline", "Open level 12").
- Each answer ends with the scope it used ("Same filters as the page · last 30 days · version 0.1.3").

## Answer blocks
Text plus any of these, drawn with the app's own components:

| Block | Use |
|---|---|
| table | per-session results, top-N lists |
| chart / sparkline | trends, drops |
| timeline | ordered events with times and tags |
| checklist | Verified / Done / Missing / Failed rows (privacy events, setup, verification) |
| funnel steps | proposed or computed funnels |
| links | buttons that open a page, drawer or filtered view |
| proposal | a change waiting for confirmation (below) |

Any answer with a headline value can be **pinned to Overview** as a tile.

## Changes need confirmation
- Reading tools run freely.
- Tools that change something (save a funnel, add a rule or highlight, set a label, write a rules file) **never run directly**: the answer shows a **proposal card** with a preview and buttons ("Save funnel", "Not now"). After confirming: "Done. Undo is in the toast."
- Permanent actions are never offered.

## Honesty
- Say when data is missing ("gdpr_applies was never logged") instead of guessing.
- Mention small samples and the range used.
- Separate what the data shows from advice ("Ways to handle it: …").
- Tone: calm and caring. Start with what's fine, then what needs care, then offer help. Nothing alarmist.

## Tools per app

| AVN Analytics (exists) | AVN PlayLens (to add) |
|---|---|
| `get_context` | `get_context` |
| `get_overview`, `list_events` | `get_session_log`, `search_logs` |
| `run_funnel`, `get_journeys`, `list_journey_players` | `get_firebase_events` |
| `get_player_story`, `find_players` | `get_perf_samples`, `get_device_info` |
| `get_level_progress` | `get_remote_config`, `get_ad_funnel` |
| `save_funnel`, `set_event_label` (**asks**) | `check_rules`, `save_rules_file` (**asks**) |
| `show_in_dashboard` | `show_in_playlens`, `explain_error` |

Implementation: tools return data; the reply carries structured blocks the UI
renders (not just markdown), and write tools return a proposal the UI confirms.
