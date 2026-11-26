# School Cafeteria: notes for Claude

A browser game designed by a 10-year-old and built with her dad. **She is the game designer.** She describes features in plain words, and we build exactly that. When a request is unclear, build the most literal reading, then ask. Don't add big features she didn't ask for; suggest them as options instead.

`NOTES.md` is **her** project journal, written in kid-friendly words. Keep it updated in that voice when features change. This file is for agents.

## Ground rules

- **Plain HTML, CSS and JS. No build step, no frameworks, no npm, no modules.** Everything must work by double-clicking `index.html` (`file://`) and on static hosting (GitHub Pages is planned). Because of `file://`, never use `fetch()` for local files, and never use ES `import`.
- Scripts are classic `<script>` tags that share **global scope**. Load order matters (see below).
- Code comments are written for a 10-year-old to read: short, simple, with emoji section headers. Keep that style.
- Shared site styles live in `../../shared/styles/main.css` (fonts, colors, button defaults, and `[hidden] { display: none !important; }`). Use the `hidden` attribute to show and hide things.
- The project is listed on the site home page through `../../projects-list.js`.

## Her design decisions (keep these unless she changes them)

- **Start screen:** the cafeteria is drawn full-screen behind everything. A big rectangle (`.big-rectangle`, inset 6vh/6vw, slightly see-through) sits in front with the title "School Cafeteria" at the top and a smaller **Play** button under it. *Everything except the background is in front of the big rectangle.*
- **Buttons grow fast on hover:** `transition: transform 0.06s`, `scale(1.12)`. She asked for "really fast". Every new button should behave the same way (Play, X, help choices, closet tools).
- **Play** → the Directions screen (same rectangle). It has the title "Directions:", her directions text (spelling lightly fixed, wording kept), no Play button, and an **X** in the top-right corner.
- **Pressing X starts the game.** There is no separate Start button.
- **Lunch lady** 👩‍🍳 walks while arrow keys are held: ↑ = forward (further away, up the screen, gets smaller), ↓ = backward (closer, bigger), ←/→ = left/right (she flips to face that way).
- **Closet** on the wall: click to open, and the tools are inside. Click a tool and the lunch lady holds it. Click and drag to use it. The dirt fades gradually; it doesn't vanish on one click.
  - 🧹 broom: crumbs on the floor
  - 🧽 sponge: mess on tables (messy tables can't be cleaned by clicking)
  - She holds **one tool at a time**. Taking another tool returns the first one. Clicking the closet while holding a tool puts it back.

## Files and load order

| Order | File | What it does |
|---|---|---|
| 1 | `cafeteria.js` | Draws the static room on a full-screen `<canvas>` and redraws on resize. Defines `TABLES` (positions as screen fractions), `TABLE_WIDTH` and `TABLE_HEIGHT`, and `drawTableFood` (true = draw lunch on the tables, which the menus use; the game sets it to false and puts DOM kids and food on the tables instead). |
| 2 | `game.js` | Game state and loop: `startGame()`, classes arrive and leave on timers, mess and crumbs, ❗ needs and the help popup, score, toasts, sounds (`playNotes`) and speech (`say`). Tunables are at the top (`KIDS`, `NEEDS`, `STARS`, timings). |
| 3 | `lunch-lady.js` | The player character. Keyboard state plus a `requestAnimationFrame` walk loop. Position is stored in screen fractions (`lady.x`, `lady.y`), clamped to `WALK_AREA`. `showLadyTool(emoji or null)` puts a tool in her hand. |
| 4 | `tools.js` | Closet and tools: the `TOOLS` config (emoji, reach, strength), `heldTool`, and the click-and-drag logic (window pointer events), which calls `brushCrumb()` or `wipeMess()` from `game.js`. |
| 5 | `script.js` | Screen flow only: Play → Directions, X → `startGame()`. |

`style.css` is in sections: start/directions screens, game HUD, tables/kids/mess, crumbs, help popup, lunch lady, closet and tools.

## How things fit together

- **Coordinates:** the canvas room and the DOM game layer (`#game`, `position: fixed; inset: 0`) both cover the whole window, so a table at `TABLES[i].x` lines up with a DOM element at `left: x*100%`. Keep new things in **screen fractions or %**, not fixed pixels, so window resizing works.
- **Floor:** starts at about 60% of screen height (`floorY = H * 0.6` in `cafeteria.js`). Tool use only counts below about 55%.
- **Table life cycle** (`table.state`): `"eating"` (kids and lunch; random ❗ needs) → timer → `"messy"` (`.mess` emojis, each with `.dirt` from 1 to 0; crumbs dropped on the floor) → all mess wiped → `"empty"` → after `NEW_CLASS_AFTER_SECONDS` → `"eating"`.
- **Dirt:** crumbs and mess carry an expando property `.dirt` (1 to 0). The tool lowers it by `strength` on each pointermove within `reach` px, and opacity follows it. Reaching 0 removes the item and awards stars.
- **Stacking:** canvas `z-index: 0`, game layer `1`, toast and score `5`, help popup `10`, dragged tool `15`, star pops `20`. The lunch lady's z-index depends on her depth (`2 + depth*10`). She has `pointer-events: none` so clicks pass through her.

## Testing (what has worked)

Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. To test, make a **temporary copy** of `index.html` with an extra `<script>` before `</body>` that drives the game, then run headless Chrome:

```bash
"$CHROME" --headless=new --disable-gpu --window-size=1280,800 --virtual-time-budget=3000 --dump-dom "file://$PWD/t.html" | grep -o '<title>[^<]*'   # write results into document.title
"$CHROME" --headless=new --disable-gpu --window-size=1280,800 --virtual-time-budget=3000 --screenshot=/path/to/scratch.png "file://$PWD/t.html"
```

Delete the temporary files afterwards. Gotchas:
- **`requestAnimationFrame` does not tick in headless mode**, so the lunch lady won't walk on her own. Stub it (`window.requestAnimationFrame = () => 0`) and call `walk(timestamp)` by hand.
- **CSS transitions and animations are often caught mid-way** in screenshots. Add `<style>*{transition:none!important}</style>` to the test copy before judging a layout.
- Simulate the game with `classLeaves(tables[i])`, `maybeSomeoneNeedsHelp()`, `closet.click()`, `document.querySelector('.closet-tool[data-tool="sponge"]').click()`, and `PointerEvent`s dispatched on `window` (pointerdown on `document.elementFromPoint(x, y)`).
- Run `node --check *.js` for a quick syntax check.

## Environment notes

- The VS Code workspace has a Salesforce (SLDS) linter that flags plain CSS with "Consider using a utility class slds-…" errors. They don't apply to this project; ignore them.
- The parent folder is a git repo with **no commits yet**. Only commit when the user asks.
- Privacy: this will become a public site. Never add the daughter's name, school, location, or photos.

## Open ideas (hers or suggested; not built yet)

- The lunch lady must walk near a table, crumb or kid to clean or help (right now tools work anywhere).
- A lunch timer or score goal, kids getting grumpy 😠 if they wait too long, levels.
- More closet tools (for example a mop for spills).
- Her own recorded voice clips (the Picture Puzzle project already plays `assets/celebration.m4a`, which can be reused as a pattern).
