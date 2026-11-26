// 🛏️ BEDROOM ESCAPE
// Click things to look at them. When you find something, it glows: click it
// to put it in your backpack. Click an item, then click where to use it.
//
// ⚠️ SPOILERS BELOW! The whole puzzle solution is in this file.

// ---------- 🎒 Items you can find ----------

const ITEMS = {
  smallKey:     { emoji: "🗝️", name: "small key" },
  flashlight:   { emoji: "🔦", name: "flashlight (no batteries!)" },
  batteries:    { emoji: "🔋", name: "batteries" },
  flashlightOn: { emoji: "🔦", name: "working flashlight", glow: true },
  note1:        { emoji: "📜", name: "note from under the bed" },
  screwdriver:  { emoji: "🪛", name: "screwdriver" },
  note2:        { emoji: "📝", name: "note from the drawer" },
  doorKey:      { emoji: "🔑", name: "door key" },
};

// Items that make something new when you put them together
const COMBINE = [
  { a: "batteries", b: "flashlight", makes: "flashlightOn",
    message: "You put the batteries in the flashlight. Click! It works! 🔦✨" },
];

// Which item works on which thing (the item flies there first, then it works)
const USES = {
  toybox: "smallKey",
  underBed: "flashlightOn",
  poster: "screwdriver",
  door: "doorKey",
};

// ---------- 📜 The notes ----------

const NOTES = {
  note1: {
    title: "📜 A note from under the bed",
    text: `My books go in <b>RAINBOW</b> order! 🌈<br>
           (red, orange, yellow, green, blue, purple)<br><br>
           Solve the math on each book.<br>
           Put the answers in rainbow order to open my desk drawer!`,
  },
  note2: {
    title: "📝 A note from the drawer",
    text: `Picture math! Each picture is a secret number. 🤔<br><br>
           <span class="equation">🧸 + 🧸 = 10</span><br>
           <span class="equation">🧸 + 🎲 = 8</span><br>
           <span class="equation">🎲 × 🎲 − 🪴 = 7</span><br><br>
           The safe code is: 🧸 🎲 🪴`,
  },
};

// ---------- 🔒 The locks and their answers ----------

const LOCKS = {
  wardrobe: { title: "🚪 Wardrobe lock", clue: "A sticky note on the lock says:<br><b>2, 4, 8, 16, ?</b>", answer: "32" },
  drawer:   { title: "🔒 Desk drawer lock", clue: "A lock with 4 numbers.", answer: "5183" },
  safe:     { title: "🔐 The safe", clue: "The safe buttons say: <b>🧸 🎲 🪴</b>", answer: "532" },
};

// The books on the shelf (in the order they stand)
const BOOKS = [
  { color: "#3a86ff", math: "18 − 15" },   // blue   = 3
  { color: "#ffd60a", math: "13 − 12" },   // yellow = 1
  { color: "#ff3b3b", math: "35 ÷ 7" },    // red    = 5
  { color: "#38b000", math: "4 × 2" },     // green  = 8
];

// ---------- 💡 Hints (the first one that isn't done yet is shown) ----------

const HINTS = [
  { done: () => !document.querySelector(".loot"), text: "Something is glowing! ✨ Click it to put it in your backpack." },
  { done: () => state.rugLifted,     text: "Things can hide UNDER other things. Look at the floor! 👀" },
  { done: () => state.toyboxOpen,    text: "That small key fits something small that has a lock... 🧸 Click the key, then click what it opens." },
  { done: () => state.wardrobeOpen,  text: "The wardrobe lock: look at the pattern. Each number is DOUBLE the one before!" },
  { done: () => state.batteriesFound, text: "Look inside the wardrobe. Shoes can hide things! 👟" },
  { done: () => has("flashlightOn") || state.note1Found, text: "Click the 🔋 batteries in your backpack, then click the 🔦 flashlight." },
  { done: () => state.note1Found,    text: "It's very dark under the bed... click the working flashlight, then click under the bed." },
  { done: () => state.drawerOpen,    text: "Read the note from under the bed, then look closely at the bookshelf 📚. Red first!" },
  { done: () => state.posterRemoved, text: "The poster is held on with screws. Do you have a tool? 🪛" },
  { done: () => state.safeOpen,      text: "Solve the picture math one line at a time. Start with 🧸 + 🧸 = 10. What number plus itself makes 10? Then use 🧸 to find 🎲, and 🎲 to find 🪴." },
  { done: () => false,               text: "You have the key! Click it, then click the door! 🚪" },
];

// ---------- Game state ----------

const state = {
  rugLifted: false,
  toyboxOpen: false,
  wardrobeOpen: false,
  batteriesFound: false,
  note1Found: false,
  drawerOpen: false,
  posterRemoved: false,
  safeOpen: false,
};

let inventory = [];     // item names in the backpack, like "smallKey"
let selected = null;    // the item you are holding
let busy = false;       // true while something is flying (clicks wait)
let hintsUsed = 0;
let startTime = null;
let timerInterval = null;

const $ = id => document.getElementById(id);
const has = item => inventory.includes(item);
const wait = ms => new Promise(done => setTimeout(done, ms));

// ---------- Messages and sounds ----------

function say(text) {
  $("message").textContent = text;
}

let audio;
function playNotes(notes) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    notes.forEach((freq, i) => {
      const start = audio.currentTime + i * 0.11;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch (e) {
    // no sound, that's okay
  }
}
const foundSound = () => playNotes([523, 784]);
const unlockSound = () => playNotes([392, 523, 659, 784]);
const nopeSound = () => playNotes([260, 200]);
const whooshSound = () => playNotes([700, 900]);

// ---------- 🕊️ Flying animations ----------

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// Where the next item will land in the backpack
function backpackSpot() {
  const box = $("inventory").getBoundingClientRect();
  return { x: inventory.length ? box.right + 35 : box.left + 30, y: box.top + box.height / 2 };
}

// An emoji flies in an arc from one spot to another
function fly(emoji, from, to, ms = 650) {
  const el = document.createElement("div");
  el.className = "flyer";
  el.textContent = emoji;
  document.body.appendChild(el);
  const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 120 };
  const at = (p, s) => `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${s})`;
  const animation = el.animate(
    [{ transform: at(from, 1) }, { transform: at(mid, 1.4), offset: 0.45 }, { transform: at(to, 0.8) }],
    { duration: ms, easing: "ease-in-out" });
  whooshSound();
  return new Promise(done => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      el.remove();
      done();
    };
    animation.onfinish = finish;
    setTimeout(finish, ms + 100);   // backup, in case the animation gets paused
  });
}

function sparkle(spot, emoji = "✨") {
  const el = document.createElement("div");
  el.className = "sparkle";
  el.textContent = emoji;
  el.style.left = spot.x + "px";
  el.style.top = spot.y + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function shake(el) {
  el.animate([{ translate: "0" }, { translate: "-8px" }, { translate: "8px" }, { translate: "0" }], { duration: 300 });
}

// ---------- ✨ Finding things ----------

// Put a glowing item inside something (a box, a drawer, under the bed...)
function reveal(name, container, style = {}) {
  const el = document.createElement("div");
  el.className = "loot";
  el.dataset.loot = name;
  el.textContent = ITEMS[name].emoji;
  el.title = ITEMS[name].name;
  Object.assign(el.style, style);
  container.appendChild(el);
  foundSound();
  return el;
}

// Click a glowing item → it flies into the backpack
async function takeLoot(el) {
  const name = el.dataset.loot;
  const from = centerOf(el);
  const to = backpackSpot();
  el.remove();
  busy = true;
  await fly(ITEMS[name].emoji, from, to);
  busy = false;
  addItem(name);
  say(`You got the ${ITEMS[name].name}! 🎒`);
  if (NOTES[name]) say(`You got the ${ITEMS[name].name}! Click it in your backpack to read it. 📖`);
  if (name === "note1") lightsOn(false);   // done looking under the bed
}

// ---------- 🎒 Backpack ----------

let justAdded = null;

function addItem(name) {
  inventory.push(name);
  justAdded = name;
  drawBackpack();
  foundSound();
}

function removeItem(name) {
  inventory = inventory.filter(i => i !== name);
  if (selected === name) selected = null;
  drawBackpack();
}

function itemButton(name) {
  return document.querySelector(`.item[data-item="${name}"]`);
}

function drawBackpack() {
  const box = $("inventory");
  box.innerHTML = "";
  inventory.forEach(name => {
    const item = ITEMS[name];
    const btn = document.createElement("button");
    btn.className = "grow-button item";
    if (selected === name) btn.classList.add("selected");
    else if (selected) btn.classList.add("can-combine");
    if (name === justAdded) btn.classList.add("new");
    btn.dataset.item = name;
    btn.textContent = item.emoji;
    btn.title = item.name;
    if (item.glow) btn.style.background = "#fff3bf";
    btn.onclick = () => clickItem(name);
    box.appendChild(btn);
  });
  justAdded = null;
  updateHand();
}

function select(name) {
  selected = name;
  drawBackpack();
}

async function clickItem(name) {
  if (busy) return;

  // Notes are for reading: they open, and you don't hold them
  if (NOTES[name] && !selected) return showNote(name);

  // Click the same item again → put it down
  if (selected === name) {
    select(null);
    return say("You put it back in your backpack.");
  }

  // Holding something else → try to put them together
  if (selected) {
    const recipe = COMBINE.find(r =>
      (r.a === selected && r.b === name) || (r.a === name && r.b === selected));
    if (!recipe) {
      nopeSound();
      shake(itemButton(name));
      shake(itemButton(selected));
      say("Those don't go together. 🤔");
      return select(null);
    }
    // ✨ They spin together and become something new
    busy = true;
    const spot = centerOf(itemButton(name));
    itemButton(recipe.a).classList.add("merging");
    itemButton(recipe.b).classList.add("merging");
    await wait(450);
    selected = null;
    removeItem(recipe.a);
    removeItem(recipe.b);
    addItem(recipe.makes);
    sparkle(spot);
    say(recipe.message);
    busy = false;
    return;
  }

  // Pick it up
  select(name);
  say(`You're holding the ${ITEMS[name].name}. Click where to use it.`);
}

// ✋ The item you hold follows the mouse
window.addEventListener("pointermove", event => {
  $("hand").style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 10}px)`;
});
function updateHand() {
  $("hand").hidden = !selected;
  if (selected) $("hand").textContent = ITEMS[selected].emoji;
}

// ---------- 🌑 Light and dark ----------

function lightsOn(on, spotEl) {
  const darkness = $("darkness");
  if (!on) {
    darkness.classList.remove("on");
    return;
  }
  // The beam starts in the middle of the room...
  darkness.style.transition = "none";
  darkness.style.setProperty("--beam-x", "50%");
  darkness.style.setProperty("--beam-y", "45%");
  darkness.offsetHeight;
  darkness.style.transition = "";
  darkness.classList.add("on");

  // ...then glides to the spot
  const stage = $("stage").getBoundingClientRect();
  const spot = centerOf(spotEl);
  setTimeout(() => {
    darkness.style.setProperty("--beam-x", ((spot.x - stage.left) / stage.width) * 100 + "%");
    darkness.style.setProperty("--beam-y", ((spot.y - stage.top) / stage.height) * 100 + "%");
  }, 300);
}

// ---------- 🔍 Pop-up box ----------

function openPopup(title, html) {
  $("popup-title").innerHTML = title;
  $("popup-body").innerHTML = html;
  $("popup").hidden = false;
}

function closePopup() {
  $("popup").hidden = true;
  lockTyping = null;
}
$("popup-close").onclick = closePopup;

function showNote(name) {
  openPopup(NOTES[name].title, `<div class="note-text">${NOTES[name].text}</div>`);
}

function showBooks() {
  const books = BOOKS.map(b =>
    `<div class="big-book" style="background:${b.color}">${b.math}</div>`).join("");
  openPopup("📚 The bookshelf", `<p class="clue">There's math on every book! 🤓</p><div class="big-books">${books}</div>`);
}

// 🔢 A number lock with a keypad (you can also type on the keyboard)
let lockTyping = null;

function showLock(lockName, onOpen) {
  const lock = LOCKS[lockName];
  let typed = "";

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✔"];
  openPopup(lock.title, `
    <p class="clue">${lock.clue}</p>
    <div id="code" class="code-display"></div>
    <div class="keypad">
      ${keys.map(k => `<button class="grow-button key ${k === "✔" ? "ok" : k === "⌫" ? "back" : ""}" data-key="${k}">${k}</button>`).join("")}
    </div>`);

  const display = $("code");
  const show = () => {
    display.textContent = typed.padEnd(lock.answer.length, "_");
  };

  function press(key) {
    display.classList.remove("wrong");
    if (key === "⌫") typed = typed.slice(0, -1);
    else if (key === "✔") return check();
    else if (typed.length < lock.answer.length) typed += key;
    show();
  }

  function check() {
    if (typed === lock.answer) {
      display.classList.add("right");
      display.textContent = "🔓 OPEN";
      lockTyping = null;
      unlockSound();
      setTimeout(() => {
        closePopup();
        onOpen();
      }, 500);
    } else {
      nopeSound();
      display.offsetHeight;
      display.classList.add("wrong");
      typed = "";
      setTimeout(show, 400);
    }
  }

  document.querySelectorAll("#popup .key").forEach(btn => (btn.onclick = () => press(btn.dataset.key)));
  lockTyping = press;
  show();
}

// Typing numbers on the keyboard works on locks too
window.addEventListener("keydown", event => {
  if (!lockTyping) return;
  if (/^[0-9]$/.test(event.key)) lockTyping(event.key);
  if (event.key === "Backspace") lockTyping("⌫");
  if (event.key === "Enter") lockTyping("✔");
});

// ---------- 🛏️ What happens when you click each thing ----------
// "item" is what you are holding (or null).

const THINGS = {
  lights() { say("Twinkly fairy lights! ✨"); },
  cat() { say("The cat is watching the birds outside. Meow! 🐾"); },
  teddy() { say("My teddy bear. So cuddly! 🧸"); },
  globe() { say("A globe of the whole world. 🌍"); },
  window() { say("It's sunny outside. The window is stuck shut. ☀️"); },
  lamp() { say("A desk lamp. Nice and bright!"); },
  desk() { say("My desk. The drawer has a lock on it. 🔒"); },
  pillow() { say("A fluffy pillow. Nothing under it... 🤔"); },
  bookshelf() { showBooks(); say("Lots of colorful books..."); },

  rug() {
    if (state.rugLifted) return say("The rug is folded back.");
    state.rugLifted = true;
    $("rug").classList.add("lifted");
    setTimeout(() => {
      reveal("smallKey", $("stage"), { position: "absolute", left: "44%", top: "86%", translate: "-50% -50%" });
      say("You lift the rug... something is under it! ✨");
    }, 400);
  },

  toybox(item) {
    if (state.toyboxOpen) return say("Toys! 🚗🪀");
    if (item === "smallKey") {
      state.toyboxOpen = true;
      removeItem("smallKey");
      $("toybox").classList.add("open");
      unlockSound();
      setTimeout(() => {
        reveal("flashlight", $("toybox-contents"));
        say("The small key fits! The lid opens... there's a flashlight inside! 🔦");
      }, 350);
      return;
    }
    say("The toy box is locked. 🔒 It has a tiny keyhole.");
  },

  wardrobe() {
    if (state.wardrobeOpen) return say("Clothes and shoes. 👕👟");
    say("The wardrobe is locked with a number lock.");
    showLock("wardrobe", () => {
      state.wardrobeOpen = true;
      $("wardrobe").classList.add("open");
      say("Click! The wardrobe opens. 🚪 Clothes and shoes inside.");
    });
  },

  shoe() {
    if (state.batteriesFound) return say("Just a shoe.");
    state.batteriesFound = true;
    reveal("batteries", $("shoe-spot"));
    say("You shake the shoe... batteries fall out! 🔋");
  },

  underBed(item) {
    if (state.note1Found) return say("Nothing else under the bed. Just dust bunnies. 🐰");
    if (item === "flashlightOn") {
      state.note1Found = true;
      lightsOn(true, $("under-bed-spot"));
      say("You shine the flashlight under the bed... 🔦");
      setTimeout(() => {
        reveal("note1", $("under-bed-spot"));
        say("There's a note under the bed! 📜");
      }, 1200);
      return;
    }
    if (item === "flashlight") return say("The flashlight has no batteries! 🔋");
    say("It's too dark under the bed to see anything! 🌑");
  },

  drawer() {
    if (state.drawerOpen) return say("The drawer is open.");
    say("The desk drawer has a 4-number lock.");
    showLock("drawer", () => {
      state.drawerOpen = true;
      $("desk").classList.add("drawer-open");
      setTimeout(() => {
        reveal("screwdriver", $("drawer-inside"));
        reveal("note2", $("drawer-inside"));
        say("The drawer slides open! Inside: a screwdriver 🪛 and a note 📝.");
      }, 400);
    });
  },

  poster(item) {
    if (item === "screwdriver") {
      state.posterRemoved = true;
      removeItem("screwdriver");
      $("poster").classList.add("removed");
      say("You unscrew the 4 screws... the poster falls. There's a SAFE behind it! 😮");
      return;
    }
    say("A unicorn poster. It's screwed onto the wall with 4 screws. 🔩");
  },

  safe() {
    if (!state.posterRemoved) return;
    if (state.safeOpen) return say("The safe is open.");
    say("A safe! It needs a 3-number code.");
    showLock("safe", () => {
      state.safeOpen = true;
      $("safe").classList.add("open");
      setTimeout(() => {
        reveal("doorKey", $("safe-inside"));
        say("The safe door swings open... there's a KEY inside! 🔑");
      }, 500);
    });
  },

  door(item) {
    if (item === "doorKey") return escape();
    say("The door is locked! 🔒 You need a key.");
  },
};

// Clicks in the room come here
$("stage").addEventListener("click", async event => {
  if (busy) return;

  // ✨ A glowing item → pick it up
  const loot = event.target.closest("[data-loot]");
  if (loot) {
    select(null);
    return takeLoot(loot);
  }

  const thingEl = event.target.closest("[data-thing]");
  if (!thingEl) return;
  const thing = thingEl.dataset.thing;
  const item = selected;

  // Holding the RIGHT item → it flies there, then it works
  if (item && USES[thing] === item) {
    busy = true;
    const from = centerOf(itemButton(item));
    select(null);
    await fly(ITEMS[item].emoji, from, { x: event.clientX, y: event.clientY }, 450);
    sparkle({ x: event.clientX, y: event.clientY });
    busy = false;
    return THINGS[thing](item);
  }

  // Holding the wrong item
  if (item) {
    THINGS[thing](item);   // (the flashlight with no batteries has its own message)
    if (!(thing === "underBed" && item === "flashlight")) {
      nopeSound();
      shake(thingEl);
      say(`The ${ITEMS[item].name} doesn't work there. 🤔`);
    }
    return select(null);
  }

  THINGS[thing](null);
});

// ---------- 💡 Hints ----------

$("hint-button").onclick = () => {
  hintsUsed++;
  const hint = HINTS.find(h => !h.done());
  openPopup("💡 Hint", `<p class="note-text">${hint.text}</p>`);
};

// ---------- ⏱️ Timer ----------

function timeText() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => ($("timer").textContent = timeText()), 1000);
}

// ---------- 🎉 Escape! ----------

function escape() {
  clearInterval(timerInterval);
  const time = timeText();
  removeItem("doorKey");
  $("door-lock").textContent = "🔓";
  unlockSound();
  say("The key turns... click!");
  setTimeout(() => {
    $("door").classList.add("open");
    playNotes([523, 659, 784, 1047, 1319]);
    say("The door opens! Sunshine! ☀️🚪✨");
  }, 500);
  setTimeout(() => {
    $("win-text").innerHTML = `You escaped in <b>${time}</b>! ⏱️<br>Hints used: <b>${hintsUsed}</b> 💡`;
    $("win-screen").hidden = false;
  }, 2000);
}

// ---------- ✨ Fairy lights ----------

function hangLights() {
  const colors = ["#ff6b9d", "#ffd166", "#6bc5ff", "#80ed99", "#c77dff"];
  const bulbs = 22;
  for (let i = 0; i < bulbs; i++) {
    const x = i / (bulbs - 1);                    // 0 = left end, 1 = right end
    const swag = Math.abs(Math.sin(x * Math.PI * 3));   // 3 droopy loops
    const bulb = document.createElement("span");
    bulb.className = "bulb";
    bulb.style.left = x * 100 + "%";
    bulb.style.top = swag * 70 + "%";
    bulb.style.setProperty("--color", colors[i % colors.length]);
    bulb.style.animationDelay = (i % 3) * 0.4 + "s";
    $("lights").appendChild(bulb);
  }
}
hangLights();

// ---------- 🟦 Start screens ----------

$("play-button").onclick = () => {
  $("start-screen").hidden = true;
  $("directions-screen").hidden = false;
};

// Pressing X on the directions starts the game
$("start-button").onclick = () => {
  $("directions-screen").hidden = true;
  startTimer();
};

$("again-button").onclick = () => location.reload();
