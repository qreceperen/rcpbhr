// 🔬 SCIENCE LAB ESCAPE
// Click things to look at them. When you find something, it glows: click it
// to put it in your backpack. Click an item, then click where to use it.
// Every puzzle is a real science experiment!
//
// ⚠️ SPOILERS BELOW! The whole puzzle solution is in this file.

// ---------- 🎒 Items you can find ----------

const ITEMS = {
  goggles:    { emoji: "🥽", name: "safety goggles" },
  bakingSoda: { emoji: "🧂", name: "baking soda" },
  iceKey:     { emoji: "🧊", name: "ice cube (something is frozen inside!)" },
  smallKey:   { emoji: "🗝️", name: "small key" },
  vinegar:    { emoji: "🍶", name: "vinegar" },
  magnet:     { emoji: "🧲", name: "magnet" },
  blankPaper: { emoji: "📄", name: "paper (it looks empty...)" },
  secretNote: { emoji: "📜", name: "secret note", glow: true },
};

// Items that make something new when you put them together
// (none in this lab yet, but you can add some here!)
const COMBINE = [];

// Which item works on which thing (the item flies there first, then it works)
const USES = {
  hotplate: ["iceKey"],
  sinkCupboard: ["smallKey"],
  volcano: ["bakingSoda", "vinegar"],
  tank: ["magnet"],
  lamp: ["blankPaper"],
};

// ---------- 📜 The notes ----------

const NOTES = {
  secretNote: {
    title: "📜 The secret note",
    text: `The door code is hiding in the <b>ELEMENTS</b>! 🧪<br><br>
           <span class="big-letters">H O C</span><br><br>
           Find each one on the big poster.<br>
           Their numbers, in this order, open the door! 🚪`,
  },
};

// ---------- 🎨 The potion lock (color mixing) ----------

const PAINT = {
  red: "#ff3b3b", yellow: "#ffd60a", blue: "#3a86ff",
  purple: "#9d4edd", orange: "#ff8c1a", green: "#38b000",
};

// Two colors mixed together make a new one
const MIXES = {
  "blue+red": "purple",
  "red+yellow": "orange",
  "blue+yellow": "green",
};

// The 3 tubes on the cabinet, and the color each one wants
const POTION_LOCK = [
  { picture: "🍇", wants: "purple" },
  { picture: "🥕", wants: "orange" },
  { picture: "🐸", wants: "green" },
];

// ---------- 🔒 The door lock ----------

const LOCKS = {
  door: { title: "🚪 The lab door", clue: "The door needs a 3-number code.", answer: "186" },   // H=1, O=8, C=6
};

// ---------- 🧪 The elements poster (the first 18 elements) ----------

const KINDS = {
  nonmetal: "#caffbf", noble: "#bdb2ff", alkali: "#ffadad", earth: "#ffd6a5",
  metalloid: "#9bf6ff", halogen: "#fdffb6", metal: "#e0e0e0",
};
const ELEMENTS = [
  [1, "H", "Hydrogen", "nonmetal"], null, null, null, null, null, null, [2, "He", "Helium", "noble"],
  [3, "Li", "Lithium", "alkali"], [4, "Be", "Beryllium", "earth"], [5, "B", "Boron", "metalloid"], [6, "C", "Carbon", "nonmetal"],
  [7, "N", "Nitrogen", "nonmetal"], [8, "O", "Oxygen", "nonmetal"], [9, "F", "Fluorine", "halogen"], [10, "Ne", "Neon", "noble"],
  [11, "Na", "Sodium", "alkali"], [12, "Mg", "Magnesium", "earth"], [13, "Al", "Aluminum", "metal"], [14, "Si", "Silicon", "metalloid"],
  [15, "P", "Phosphorus", "nonmetal"], [16, "S", "Sulfur", "nonmetal"], [17, "Cl", "Chlorine", "halogen"], [18, "Ar", "Argon", "noble"],
];

// ---------- 💡 Hints (the first one that isn't done yet is shown) ----------

const HINTS = [
  { done: () => !document.querySelector(".loot"), text: "Something is glowing! ✨ Click it to put it in your backpack." },
  { done: () => state.gogglesFound,  text: "Scientists wear a lab coat... check its pockets! 🥼" },
  { done: () => state.gogglesOn,     text: "Click the 🥽 goggles in your backpack to put them on. Safety first!" },
  { done: () => state.cabinetOpen,   text: "Click the cabinet. 🍇 is PURPLE, 🥕 is ORANGE, 🐸 is GREEN. Which two colors mix to make each one?" },
  { done: () => state.iceFound,      text: "Brrr! Have you looked in the freezer? ❄️" },
  { done: () => state.iceMelted,     text: "Ice melts when it gets hot! Click the hot plate to turn it on 🔥, then use the ice on it." },
  { done: () => state.sinkOpen,      text: "That small key fits the cupboard under the sink. 🚰" },
  { done: () => state.erupted,       text: "The volcano wants to erupt! 🌋 Use the baking soda AND the vinegar on it." },
  { done: () => state.tinOpened,     text: "There's a metal tin in the fish tank. 🐠 Magnets pull metal!" },
  { done: () => state.inkShown,      text: "The paper looks empty... Secret lemon ink shows up when it gets WARM. Try the lamp! 💡" },
  { done: () => false,               text: "Read the secret note, then find H, O and C on the elements poster. Type their numbers on the door: H first, then O, then C!" },
];

// ---------- Game state ----------

const state = {
  gogglesFound: false,
  gogglesOn: false,
  tubesFilled: 0,
  cabinetOpen: false,
  iceFound: false,
  hotplateOn: false,
  iceMelted: false,
  sinkOpen: false,
  sodaIn: false,
  vinegarIn: false,
  erupted: false,
  tinOpened: false,
  inkShown: false,
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
const big = word => word[0].toUpperCase() + word.slice(1);

// ---------- Messages and sounds ----------

function say(text) {
  $("message").innerHTML = text;
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
const pourSound = () => playNotes([330, 294]);

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

// Put a glowing item inside something (the freezer, a cupboard...)
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
  if (name === "goggles") say("You got safety goggles! 🥽 Click them in your backpack to put them on.");
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

  // 🥽 Goggles go on your face!
  if (name === "goggles" && !selected) {
    state.gogglesOn = true;
    removeItem("goggles");
    $("goggles-badge").hidden = false;
    sparkle(centerOf($("goggles-badge")), "🥽");
    foundSound();
    return say("You put on the safety goggles. 🥽 Now you are a real scientist!");
  }

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

// ---------- 🔍 Pop-up box ----------

let popupKind = null;   // which pop-up is open ("mixer", "lock"...)

function openPopup(title, html, kind = "note") {
  $("popup-title").innerHTML = title;
  $("popup-body").innerHTML = html;
  $("popup").hidden = false;
  popupKind = kind;
}

function closePopup() {
  $("popup").hidden = true;
  popupKind = null;
  lockTyping = null;
}
$("popup-close").onclick = closePopup;

function showNote(name) {
  openPopup(NOTES[name].title, `<div class="note-text">${NOTES[name].text}</div>`);
}

// 🧪 The elements poster, big
function showElements() {
  const boxes = ELEMENTS.map(e => e
    ? `<div class="element" style="--c:${KINDS[e[3]]}"><span class="num">${e[0]}</span><span class="sym">${e[1]}</span><span class="name">${e[2]}</span></div>`
    : `<div class="element empty"></div>`).join("");
  openPopup("🧪 The Elements", `
    <p class="clue">Everything in the world is made of elements!<br>Each one has a letter and a number.</p>
    <div class="big-table">${boxes}</div>`);
}

// The small poster on the wall
function drawPoster() {
  $("ptable-grid").innerHTML = ELEMENTS.map(e => e
    ? `<span class="mini-cell" style="--c:${KINDS[e[3]]}">${e[1]}</span>`
    : `<span></span>`).join("");
}

// ⚗️ The potion mixer
let poured = [];
let mixing = false;

function showMixer() {
  poured = [];
  mixing = false;
  const tubes = POTION_LOCK.map((tube, i) => `
    <div class="tube-box">
      <div class="big-tube ${i === state.tubesFilled ? "now" : ""}">
        <span style="background:${i < state.tubesFilled ? PAINT[tube.wants] : "transparent"}"></span>
      </div>
      ${tube.picture}
    </div>`).join("");
  const bottles = ["red", "yellow", "blue"].map(color => `
    <button class="grow-button pour-bottle" data-color="${color}">
      <span class="glass" style="--c:${PAINT[color]}"></span>${big(color)}
    </button>`).join("");
  openPopup("⚗️ The potion lock", `
    <p class="clue">Each tube needs the color of its picture.<br>Pour <b>two</b> bottles into the beaker to mix them!</p>
    <div class="tubes">${tubes}</div>
    <div class="mixer-row">
      <div class="bottles">${bottles}</div>
      <div class="beaker"><div id="beaker-liquid" class="beaker-liquid"></div></div>
    </div>
    <p id="mix-message" class="mix-message">Which two colors make ${POTION_LOCK[state.tubesFilled].picture}?</p>`, "mixer");
  document.querySelectorAll(".pour-bottle").forEach(btn => (btn.onclick = () => pour(btn.dataset.color)));
}

function mixColors(a, b) {
  if (a === b) return a;
  return MIXES[[a, b].sort().join("+")];
}

function pour(color) {
  if (mixing) return;
  poured.push(color);
  pourSound();
  const liquid = $("beaker-liquid");
  const message = $("mix-message");

  // The first bottle: the beaker is half full
  if (poured.length === 1) {
    liquid.style.height = "40%";
    liquid.style.background = PAINT[color];
    message.textContent = `You poured ${color}. Now pour one more!`;
    return;
  }

  // The second bottle: the colors mix!
  mixing = true;
  const made = mixColors(poured[0], poured[1]);
  const tube = POTION_LOCK[state.tubesFilled];
  liquid.style.height = "80%";
  liquid.style.background = PAINT[made];

  if (made === tube.wants) {
    message.innerHTML = `${big(poured[0])} + ${poured[1]} = <b>${made.toUpperCase()}</b>! Just right for ${tube.picture} ✨`;
    foundSound();
    setTimeout(() => {
      const fill = $("tube-" + state.tubesFilled);
      fill.style.setProperty("--c", PAINT[made]);
      fill.classList.add("full");
      state.tubesFilled++;
      if (state.tubesFilled === POTION_LOCK.length) {
        closePopup();
        openCabinet();
      } else if (popupKind === "mixer") {
        showMixer();   // on to the next tube
      }
    }, 1300);
  } else {
    nopeSound();
    message.innerHTML = `You made <b>${made}</b>. ${tube.picture} needs a different color. Try again! 🙂`;
    setTimeout(() => {
      poured = [];
      liquid.style.height = "0";
      mixing = false;
    }, 1500);
  }
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
    </div>`, "lock");

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

// ---------- 🧪 The experiments ----------

function openCabinet() {
  state.cabinetOpen = true;
  $("cabinet").classList.add("open");
  unlockSound();
  setTimeout(() => {
    reveal("bakingSoda", $("cabinet-spot"));
    say("All 3 tubes are full. The cabinet opens! There's baking soda inside. 🧂<br>" +
        "🔬 Science fact: red, yellow and blue are PRIMARY colors. Mix them to make new colors!");
  }, 450);
}

// 🌋 Baking soda + vinegar = FIZZ!
async function erupt() {
  state.erupted = true;
  const volcano = $("volcano");
  volcano.classList.add("rumble");
  say("The volcano starts to bubble and shake... 😮");
  playNotes([200, 220, 250, 280]);
  await wait(900);
  volcano.classList.remove("rumble");
  volcano.classList.add("erupted");
  playNotes([523, 659, 784, 1047]);

  // White foam bubbles fly out of the top
  const stage = $("stage");
  const size = stage.offsetWidth;
  for (let i = 0; i < 26; i++) {
    const foam = document.createElement("div");
    foam.className = "foam";
    foam.style.left = "50%";
    foam.style.top = "37%";
    stage.appendChild(foam);
    const dx = (Math.random() - 0.5) * size * 0.14;
    const up = -(0.06 + Math.random() * 0.1) * size;
    foam.animate([
      { transform: "translate(-50%, -50%) scale(0.4)" },
      { transform: `translate(${dx}px, ${up}px) scale(1)`, offset: 0.5 },
      { transform: `translate(${dx * 1.4}px, ${up * 0.2}px) scale(0.6)`, opacity: 0 },
    ], { duration: 1100 + Math.random() * 500, easing: "ease-out", delay: i * 25 });
    setTimeout(() => foam.remove(), 1800);
  }
  await wait(700);
  reveal("magnet", $("volcano-spot"));
  say("FIZZ! The volcano erupts! 🌋 The foam pushed something out... a magnet! 🧲<br>" +
      "🔬 Science fact: vinegar + baking soda make a gas called carbon dioxide. That's the fizz!");
}

// ---------- 🔬 What happens when you click each thing ----------
// "item" is what you are holding (or null).

const THINGS = {
  rocket() { say("A model rocket! 🚀 One day, to the Moon!"); },
  whiteboard() { say("H₂O means water: 2 hydrogens and 1 oxygen. 💧"); },
  clock() { say("Tick tock! Better escape fast! 🕒"); },
  microscope() { say("You look in the microscope... tiny cells! 🦠 Too small to see without it."); },
  extinguisher() { say("A fire extinguisher. Every lab needs one! 🧯"); },
  plant() { say("Plants drink water and use sunlight to make food. 🌱"); },
  bench() { say("A big lab bench for experiments. 🧑‍🔬"); },
  sink() { say("You wash your hands. Scientists keep clean! 🧼"); },
  ptable() { showElements(); say("The elements poster. 🧪"); },

  coat() {
    if (state.gogglesFound) return say("A white lab coat. The pockets are empty now.");
    state.gogglesFound = true;
    reveal("goggles", $("stage"), { position: "absolute", left: "26.5%", top: "20%", translate: "-50% 0" });
    say("You check the lab coat pockets... something is inside! ✨");
  },

  cabinet() {
    if (state.cabinetOpen) return say("Colorful potions on the shelf. 🧪");
    if (!state.gogglesOn) {
      if (has("goggles")) return say("Safety first! 🥽 Click your goggles in the backpack to put them on.");
      return say("The cabinet has a potion lock! 🔒 But wait... scientists wear goggles before mixing. 🥽");
    }
    showMixer();
    say("Mix the potions to fill the tubes!");
  },

  freezer() {
    if (state.iceFound) return say("Brrr! It's cold in there. ❄️");
    state.iceFound = true;
    $("freezer").classList.add("open");
    setTimeout(() => {
      reveal("iceKey", $("freezer-inside"));
      say("You open the freezer. There's an ice cube... something is frozen inside it! 🧊");
    }, 400);
  },

  hotplate(item) {
    if (item === "iceKey") {
      if (!state.hotplateOn) return say("The hot plate is cold. Click it to turn it on first! 🔥");
      state.iceMelted = true;
      removeItem("iceKey");
      const ice = document.createElement("div");
      ice.className = "melting";
      ice.textContent = "🧊";
      $("hotplate-spot").appendChild(ice);
      say("The ice is melting... 💧");
      setTimeout(() => {
        ice.remove();
        reveal("smallKey", $("hotplate-spot"));
        say("The ice melted into water! 💧 A small key was inside! 🗝️<br>" +
            "🔬 Science fact: heat turns solid ice into liquid water. That's called melting!");
      }, 1700);
      return;
    }
    state.hotplateOn = !state.hotplateOn;
    $("hotplate").classList.toggle("on", state.hotplateOn);
    if (state.hotplateOn) say("You turn on the hot plate. It's getting HOT! 🔥 Don't touch!");
    else say("You turn off the hot plate.");
  },

  sinkCupboard(item) {
    if (state.sinkOpen) return say("The cupboard under the sink is open.");
    if (item === "smallKey") {
      state.sinkOpen = true;
      removeItem("smallKey");
      $("sink-cupboard").classList.add("open");
      unlockSound();
      setTimeout(() => {
        reveal("vinegar", $("sink-inside"));
        say("The small key fits! There's a bottle of vinegar inside. 🍶");
      }, 400);
      return;
    }
    say("The cupboard under the sink is locked. 🔒 It has a tiny keyhole.");
  },

  volcano(item) {
    if (state.erupted) return say("The volcano is all foamy! 🌋");
    if (item === "bakingSoda") {
      state.sodaIn = true;
      removeItem("bakingSoda");
      if (state.vinegarIn) return erupt();
      return say("You pour the baking soda into the volcano. Nothing happens... yet! 🤔");
    }
    if (item === "vinegar") {
      state.vinegarIn = true;
      removeItem("vinegar");
      if (state.sodaIn) return erupt();
      return say("You pour the vinegar into the volcano. Nothing happens... yet! 🤔");
    }
    if (state.sodaIn) return say("There's baking soda in the volcano. It needs something else... 🤔");
    if (state.vinegarIn) return say("There's vinegar in the volcano. It needs something else... 🤔");
    say('A model volcano. The sign says "Make me erupt!" 🌋');
  },

  tank(item) {
    if (state.tinOpened) return say("The fish are happy. 🐠🐟");
    if (item === "magnet") {
      state.tinOpened = true;
      removeItem("magnet");
      const magnet = document.createElement("div");
      magnet.className = "magnet-hold";
      magnet.textContent = "🧲";
      $("tank-top").appendChild(magnet);
      say("You hold the magnet over the tank... 🧲");
      setTimeout(() => $("tin").classList.add("up"), 300);
      setTimeout(() => {
        $("tin").classList.add("gone");
        magnet.remove();
        reveal("blankPaper", $("tank-top"));
        say("The magnet pulled up the metal tin! Inside is a dry piece of paper. 📄<br>" +
            "🔬 Science fact: magnets pull things made of iron and steel!");
      }, 1700);
      return;
    }
    say("A fish tank! 🐠 There's a metal tin at the bottom. You can't reach it, and the fish say: no hands!");
  },

  lamp(item) {
    if (item === "blankPaper") {
      state.inkShown = true;
      removeItem("blankPaper");
      addItem("secretNote");
      sparkle(centerOf($("lamp")));
      return say("You hold the paper near the warm lamp... secret writing appears! 📜 Click it to read.<br>" +
                 "🔬 Science fact: it was written in lemon juice! Lemon juice turns brown when it gets warm.");
    }
    say("A lamp. It feels warm. 💡");
  },

  door() {
    showLock("door", escape);
    say("The door has a number lock. 🔢");
  },
};

// Clicks in the lab come here
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
  if (item && (USES[thing] || []).includes(item)) {
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
    nopeSound();
    shake(thingEl);
    say(`The ${ITEMS[item].name} doesn't work there. 🤔`);
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
  $("door-pad").textContent = "🔓";
  say("Beep beep beep... click!");
  setTimeout(() => {
    $("door").classList.add("open");
    playNotes([523, 659, 784, 1047, 1319]);
    say("The door opens! You did it, scientist! 🔬🚪✨");
  }, 500);
  setTimeout(() => {
    $("win-text").innerHTML = `You escaped in <b>${time}</b>! ⏱️<br>Hints used: <b>${hintsUsed}</b> 💡`;
    $("win-screen").hidden = false;
  }, 2000);
}

// ---------- 🟦 Start screens ----------

drawPoster();

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
