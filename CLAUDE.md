# Daddy & Daughter Projects: notes for Claude

A dad and his 10-year-old daughter build educational games and activities together. Some games she plays herself; some are for the "junior class" (5–6 year olds) she teaches in pretend play. **She is often the game designer**: she describes features in plain words, and we build exactly that. When a request is unclear, build the most literal reading, then ask. Suggest bigger extras as options; don't add them unasked.

## The site

- Static website: plain **HTML, CSS and JS. No build step, no frameworks, no npm, no ES modules.** Everything must work both by double-clicking an `index.html` (`file://`) and on GitHub Pages. Because of `file://`, never `fetch()` local files; use classic `<script>` tags (shared globals, load order matters).
- **Live:** https://qreceperen.github.io/rcpbhr/ (GitHub Pages serves `main` from the root, and every push to `main` redeploys within a minute or two).
- **Repo:** `git@github.com:qreceperen/rcpbhr.git` (public). Pushing over SSH works. The `gh` CLI is **not** installed.
- No custom domain yet. If one is added later: GitHub Pages settings plus DNS at a registrar with WHOIS privacy.

## Layout

```
index.html          home page: cards built from projects-list.js, with category filters
projects-list.js    PROJECTS array: add one entry per new project (newest first)
shared/styles/main.css   shared colors, font, buttons, and [hidden]{display:none!important}
projects/<YYYY-MM-name>/  one self-contained project: index.html, style.css, *.js, NOTES.md, assets/
projects/_template/  copy this to start a new project
ideas/ideas.md       the idea list (move items to "Done" when built)
journal/             build-day photos (keep faces and names out)
```

Projects link back home with `../../index.html` and load `../../shared/styles/main.css`.

**Current projects:** Guess the Number, Little Classroom (has a Turkish lesson that uses a `tr-TR` voice), Picture Puzzle (jigsaw shapes in `jigsaw.js`), School Cafeteria (see its own `CLAUDE.md`), Bedroom Escape (all puzzle answers are in `game.js`).

## Adding a project

1. Copy `projects/_template` to `projects/YYYY-MM-name/`.
2. Build it. Fill in `NOTES.md`.
3. Add an entry to `projects-list.js`, and move the idea to "Done" in `ideas/ideas.md`.

## Conventions

- **`NOTES.md` in each project is HER journal**, in kid-friendly words. Keep it updated in that voice. Agent-facing notes go in `CLAUDE.md` files.
- Code comments are written for a 10-year-old: short, plain words, emoji section headers.
- Her design style (use it in her games unless she asks otherwise):
  - Start screen: the scene drawn behind a big rounded rectangle (`inset: 6vh 6vw`), the title at the top, a **Play** button under it.
  - **Buttons grow fast on hover:** `transition: transform 0.06s; :hover → scale(1.12)`.
  - Play opens a "Directions:" screen with an **X** in the top-right corner. **Pressing X starts the game.**
- Sizes inside game scenes use `%`, `vh` or container units (`cqw`) so they work on any screen.
- Animate `transform` and `opacity`, not `left/top/width/height`. Keep feedback short (100–300ms) and never block play on an animation.
- For young kids: big touch targets, read text aloud (`speechSynthesis`), gentle "try again" instead of failing, and pointer events so it works on tablets.

## Privacy (this is a public site about a child)

- Never add the daughter's name, school, city, photos of faces, or any family details to the site, code, or commits.
- Voice recordings (`*.m4a`) are **git-ignored on purpose**. They play locally, and online the games fall back to `speechSynthesis`. Don't un-ignore them or upload them.
- Git identity is set **locally in this repo** to `qreceperen <78275768+qreceperen@users.noreply.github.com>` to keep the dad's email and full name private. Don't change it.

## Git

- Work on `main` (that's what Pages serves). Commit or push only when the user asks.
- End commit messages with the attribution trailer the session provides.
- Before publishing anything new, scan for personal info and check `git status --ignored` so private files stay out.

## Testing (what has worked)

- `node --check file.js` for syntax.
- Headless Chrome: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=1280,800 --virtual-time-budget=N` with `--dump-dom` or `--screenshot`. Drive the game from a **temporary copy** of `index.html` with an extra `<script>`, and delete the copies afterwards.
- Gotchas found the hard way:
  - `requestAnimationFrame` doesn't tick in headless. Stub it and call loops by hand.
  - CSS transitions and animations are often caught mid-way. Add `*{transition:none!important}` to test copies before judging layout.
  - Web Animations `onfinish` may never fire in headless, so game code keeps a `setTimeout` fallback (see `fly()` in Bedroom Escape).
  - **Setting `document.title` repeatedly during a long run crashed this headless Chrome** (a GPU "SharedImageManager" error). Write the results to the title **once**, at the end.
- Check the live site with `curl -s -o /dev/null -w '%{http_code}' https://qreceperen.github.io/rcpbhr/<path>`.
- The VS Code workspace has a Salesforce SLDS linter that flags plain CSS ("Consider using a utility class slds-…"). It doesn't apply here; ignore it.
