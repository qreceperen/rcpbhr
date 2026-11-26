# School Cafeteria

**Date started:** November 2026
**Category:** Game

## 💡 The idea
A game that happens in the school cafeteria. (Designed by me!)

## 🛠️ What we built so far
- A start screen: a big rectangle with "School Cafeteria" on top
- A cafeteria drawn behind it: windows, menu board, clock, food counter, tables
- A "Play" button that grows really fast when the mouse touches it
- A Directions screen (after Play) with an X button to close it

## 🎨 How to change things
- Button grow speed: `transition: transform 0.06s` in `style.css` (smaller = faster)
- Button grow size: `scale(1.12)` in `style.css` (bigger = grows more)
- The cafeteria picture: `cafeteria.js`

- Press X on the directions → the game starts!
- 👩‍🍳 The lunch lady walks with the arrow keys (↑ forward, ↓ backward, ← left, → right)
- 🧽 When a class leaves, the table gets messy and glows. Get the sponge from the closet and click and drag on the table to wipe the mess away (+2 ⭐)
- 🧹 Crumbs fall on the floor. Click the closet → it opens → click the broom → the lunch lady holds it → click and drag on the floor to sweep. Crumbs fade away (+1 ⭐)
- The lunch lady holds one tool at a time. Click the closet again to put it back
- Tool settings (how far it reaches, how fast it cleans) are in `tools.js`
- ❗ Kids need help: click them, read what they need, pick the right thing (+3 ⭐)

## 🎨 Easy things to change in `game.js`
- `NEEDS`: add new things kids can need
- `KIDS`, `LUNCH`, `CRUMBS`: change the emojis
- `CLASS_STAYS_SECONDS`: how long a class eats
- `STARS`: how many stars each job gives

## 🚀 Ideas for next time
- The lunch lady has to walk to a table to clean it
- A timer: how many stars can you get before lunch is over?
- Kids get grumpy 😠 if you wait too long
- Levels: more classes, faster!
