# Little Classroom: notes for Claude

A pretend-play teaching game for 5–6 year olds (the daughter is the teacher). Everything is read aloud with `speechSynthesis`. Root `CLAUDE.md` rules apply. `NOTES.md` is her journal.

## Files and load order (classic scripts sharing globals)

| Order | File | What it does |
|---|---|---|
| 1 | `lessons.js` | Her own questions (`MY_QUESTIONS`). She edits this by hand. |
| 2 | `script.js` | Core: `LESSONS`, `say()`, `playNotes()`, `showScreen()`, `goToDesk()` + `leaveJobs`, `startLesson()`, question flow, `earnStar()`, `finishLesson()`. |
| 3 | `more-lessons.js` | Adds `LESSONS.animals/opposites/bigger/patterns/math/feelings/time`. |
| 4 | `students.js` | Names in `localStorage["classroom-students"]`; `nextTurn()`, `showTurn()`, `giveStudentStar()`, `studentStarsText()`. |
| 5 | `voice.js` | MediaRecorder clips saved as data URLs in `localStorage["classroom-voice-<key>"]`; `playVoice(key)` returns false if none (then callers use `say`). |
| 6 | `jar.js` | Marbles in `localStorage["classroom-jar"]`; `addMarble()`, `jarIsFull()`, `showParty()`. Any element with `data-jar` / `data-jar-count` is redrawn. |
| 7 | `chalkboard.js` | Free drawing canvas (pointer events). |
| 8–11 | `sorting.js`, `matching.js`, `tracing.js`, `recess.js` | Games: `LESSONS.x = { group: "game", start }`. They call `earnStar()` and end with `finishLesson()` (recess goes back to the desk instead). |
| 12 | `desk.js` | Runs last: `buildDesk()` (lessons vs. games grids), `drawJars()`, `drawStudents()`. |

## How things fit

- A question lesson has `makeQuestion()` (or `makeQuestions()`), returning `{ prompt, speak, picture, pictureClass, choices:[{label,value}], choiceClass, answer, explain, explainSpeak? }`. `choiceClass: "words"` gives choice buttons a picture + word layout.
- Every star goes through `earnStar()`: lesson stars, the current student's stars, and a jar marble.
- Timers that must stop when leaving a screen are registered in `leaveJobs`.
- Delayed `setTimeout` steps check that their screen is still visible before moving on.
- Tracing: a letter counts as traced when ≥65% of sampled letter pixels have ink within 5% of the canvas size, and ≤60% of the ink is off the letter. Tested: a finger-width line down the middle passes for every letter in `LETTER_WORDS`.
- Privacy: names and recordings live only in the browser's localStorage, never in code or git.

## Testing notes

- Windows Chrome: `"/c/Program Files/Google/Chrome/Application/chrome.exe"`. Use a scratch `--user-data-dir` so localStorage starts clean.
- A full playthrough needs about 220s of virtual time (`--virtual-time-budget=600000`).
- Web Animations (bubbles, confetti) don't advance in headless; add `*{animation:none!important}` to judge layout.
