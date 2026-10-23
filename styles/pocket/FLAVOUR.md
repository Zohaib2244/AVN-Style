# Flavour: made for nutmag2469

The personal layer of Pocket. Agents use these motifs when they draw art, name
palettes, write empty states or add a small surprise. The UX never depends on them;
another style can drop all of this.

## About the person
White PC · Xbox Series S controller (main) · Baymax on the screen and a NutBot toy ·
Star Wars · Minecraft (vanilla and Dungeons) · black cat **Dora** · HP mini PC server ·
gamer name **nutmag2469** (the nut theme comes from it) · dried hibiscus · Death Stranding.

Pocket reads all of that as a workshop: warm, tactile, a little handmade. The shell is
cream (light theme) and its backlit LCD is olive (dark theme). Small jokes are fine.

## Motifs and the job each one does

| Motif | Job | Where |
|---|---|---|
| **Blocks** (Minecraft mood) | isometric block piles that drop in once, landing with the spring curve; the only decoration an empty page gets | empty states (`.iso`) |
| **The mini PC as a cartridge** | the HP mini PC drawn as a cartridge sliding into the top of the handheld; batches are packets "delivered" into it | Server status page art (`.srv-art`, `scenes/cartridge-server.svg`), Data health |
| **Dora on the LCD** | means "nothing needs you": Dora asleep on a monitor, drawn in 1-bit on an LCD panel; slow breathing, now and then an ear twitch | "Needs a look" when nothing does (`.lcd` + `.scene`, `scenes/dora-lcd.svg`) |
| **Face buttons** | each shell's accent is its natural button colour: cream → yellow, mint → coral, lagoon → yellow, grape → lime | palettes |
| **Keys** | buttons, rockers and keycaps have a bottom edge and press flat | `skin.css` |
| **Controller habits** | everything reachable by keyboard; Ctrl / shows keycaps | shortcuts |

## Rules
- **Homage, never copies.** No logos, characters, names or quotes from games, films, consoles or brands. Shapes, colours and moods only: a cream shell, a slot, a 1-bit screen.
- **Dora, the nut and NutBot are ours** and can appear by name.
- Flavour lives in **moments**: empty states, boot, success, palette names, the server page. Never inside tables or numbers.
- **One motif per screen**, at most.
- Scenes are drawn with `currentColor`, `var(--text)` and `var(--accent)` only, so they work in both themes and every palette.
- Respect reduced motion: scenes show their still frame (the cat asleep, the cartridge seated, the packets visible).

## Ideas not built yet
A boot screen where the shell's power LED comes on before the name types in · D-pad and face-button glyphs on shortcut keycaps · a "low battery" joke for an expired session · a contrast slider drawn as the LCD's contrast wheel · block piles that stack higher the longer a page has been empty.
