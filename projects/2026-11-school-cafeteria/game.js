// 🎮 THE CAFETERIA GAME
// You are the lunch lady!
//   🧽 When a class leaves, get the sponge from the closet and wipe the messy table.
//   🧹 Get the broom from the closet, then drag it over the crumbs.
//   ❗ When a kid has an exclamation mark, click them and help!

// ---------- Things you can change ----------

const KIDS = ["👦", "👧", "🧒", "👦🏽", "👧🏾", "🧒🏻", "👦🏿", "👧🏼", "🧒🏾"];
const LUNCH = ["🍕", "🍔", "🥪", "🍝", "🌮", "🌭", "🥗", "🍟", "🍎", "🧃", "🥛", "🍌"];
const MESS = ["💦", "🍝", "🍟", "🥫", "🧃"];
const CRUMBS = ["🍪", "🍟", "🥕", "🍞"];

// What kids can need, and the right thing to help them
const NEEDS = [
  { text: "I spilled my milk!", answer: "🧻" },
  { text: "I need a fork!", answer: "🍴" },
  { text: "I need a spoon for my soup!", answer: "🥄" },
  { text: "I'm thirsty!", answer: "🥛" },
  { text: "I dropped my apple!", answer: "🍎" },
  { text: "I need ketchup for my fries!", answer: "🍅" },
  { text: "I'm still hungry!", answer: "🍕" },
  { text: "My hands are sticky!", answer: "🧼" },
];

const CLASS_STAYS_SECONDS = [15, 25];    // how long a class eats (shortest, longest)
const NEW_CLASS_AFTER_SECONDS = [3, 6];  // wait after a table is cleaned
const STARS = { table: 2, crumb: 1, help: 3 };

// ---------- Helpers ----------

const random = (min, max) => min + Math.random() * (max - min);
const pick = list => list[Math.floor(Math.random() * list.length)];
const shuffle = list => [...list].sort(() => Math.random() - 0.5);

function makeEmoji(char, className) {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = char;
  return el;
}

function say(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.rate = 0.95;
  voice.pitch = 1.3;   // a kid's voice
  speechSynthesis.speak(voice);
}

let audio;
function playNotes(notes) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    notes.forEach((freq, i) => {
      const start = audio.currentTime + i * 0.1;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  } catch (e) {
    // no sound, that's okay
  }
}

// ---------- Game state ----------

const gameLayer = document.getElementById("game");
const scoreText = document.getElementById("score");
const toast = document.getElementById("toast");
let score = 0;
let tables = [];          // one entry for every table in the cafeteria
let gameStarted = false;

function addStars(amount, x, y) {
  score += amount;
  scoreText.textContent = score;
  // a little "+2 ⭐" floats up where you clicked
  const pop = makeEmoji(`+${amount} ⭐`, "star-pop");
  pop.style.left = x + "px";
  pop.style.top = y + "px";
  gameLayer.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
}

let toastTimer;
function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 2500);
}

// ---------- Starting ----------

function startGame() {
  if (gameStarted) return;
  gameStarted = true;

  // Redraw the cafeteria with empty tables
  drawTableFood = false;
  drawCafeteria();
  gameLayer.hidden = false;

  // Make a spot on top of every table
  tables = TABLES.map(t => {
    const spot = document.createElement("div");
    spot.className = "table-spot";
    Object.assign(spot.style, {
      left: t.x * 100 + "%",
      top: t.y * 100 + "%",
      width: TABLE_WIDTH * 100 + "%",
      height: TABLE_HEIGHT * 100 + "%",
    });
    gameLayer.appendChild(spot);
    const table = { spot, state: "empty", kids: [] };
    // Clicking a messy table without the sponge gives a hint
    spot.onclick = () => {
      if (table.state === "messy" && heldTool !== "sponge") {
        showToast("🧽 Get the sponge from the closet first!");
      }
    };
    return table;
  });

  // Classes come in one after another
  tables.forEach((table, i) => setTimeout(() => classArrives(table), i * 1200));

  // Every few seconds, maybe a kid needs something
  setInterval(maybeSomeoneNeedsHelp, 3500);

  startLunchLady();

  showToast("🍽️ Lunch time! Use the arrow keys to walk!");
}

// ---------- Classes ----------

function classArrives(table) {
  table.state = "eating";
  table.kids = [0.21, 0.51, 0.81].map(fx => {
    const kid = makeEmoji(pick(KIDS), "kid");
    kid.style.left = fx * 100 + "%";
    const food = makeEmoji(pick(LUNCH), "lunch");
    food.style.left = fx * 100 + "%";
    table.spot.append(kid, food);
    const kidInfo = { el: kid, food, need: null, table };
    kid.onclick = event => {
      event.stopPropagation();
      if (kidInfo.need) openHelp(kidInfo);
    };
    return kidInfo;
  });

  const stay = random(...CLASS_STAYS_SECONDS) * 1000;
  table.leaveTimer = setTimeout(() => classLeaves(table), stay);
}

function classLeaves(table) {
  // If we were helping someone from this table, close the help box
  if (helping && helping.table === table) closeHelp();

  table.kids.forEach(k => {
    k.el.classList.add("leaving");
    k.food.remove();
    setTimeout(() => k.el.remove(), 600);
  });
  table.kids = [];

  // The table gets messy...
  table.state = "messy";
  table.spot.classList.add("messy");
  for (let i = 0; i < 3; i++) {
    const mess = makeEmoji(pick(MESS), "mess");
    mess.style.left = random(12, 88) + "%";
    mess.style.top = random(20, 80) + "%";
    mess.style.rotate = random(-30, 30) + "deg";
    mess.dirt = 1;   // 1 = fully dirty, 0 = all wiped away
    table.spot.appendChild(mess);
  }

  // ...and crumbs fall on the floor
  const count = Math.floor(random(2, 4));
  for (let i = 0; i < count; i++) dropCrumb();

  showToast("🧽 A class left! Clean the table and broom the floor!");
}

// ---------- 🧽 Cleaning tables ----------

// The sponge rubs one bit of mess: it fades a bit more each time
function wipeMess(table, mess, amount) {
  if (table.state !== "messy" || mess.dirt <= 0) return;
  mess.dirt -= amount;
  mess.style.opacity = Math.max(0, mess.dirt);
  if (mess.dirt <= 0) mess.remove();

  // All the mess is gone → the table is clean!
  if (table.spot.querySelectorAll(".mess").length === 0) tableIsClean(table);
}

function tableIsClean(table) {
  table.state = "empty";
  table.spot.classList.remove("messy");

  const sparkle = makeEmoji("✨", "sparkle");
  table.spot.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 700);

  playNotes([660, 880]);
  const r = table.spot.getBoundingClientRect();
  addStars(STARS.table, r.left + r.width / 2, r.top);

  // A new class comes after a little while
  setTimeout(() => classArrives(table), random(...NEW_CLASS_AFTER_SECONDS) * 1000);
}

// ---------- 🧹 Brooming the floor ----------

function dropCrumb() {
  const crumb = makeEmoji(pick(CRUMBS), "crumb");
  // find a floor spot that isn't on a table
  let x, y;
  for (let tries = 0; tries < 20; tries++) {
    x = random(0.03, 0.95);
    y = random(0.63, 0.95);
    const onTable = TABLES.some(t =>
      x > t.x - 0.03 && x < t.x + TABLE_WIDTH + 0.03 &&
      y > t.y - 0.06 && y < t.y + TABLE_HEIGHT + 0.06);
    if (!onTable) break;
  }
  crumb.style.left = x * 100 + "%";
  crumb.style.top = y * 100 + "%";
  crumb.style.rotate = random(0, 360) + "deg";
  crumb.dirt = 1;   // 1 = fully dirty, 0 = all swept away
  // Clicking a crumb without the broom gives a hint
  crumb.onclick = () => {
    if (heldTool !== "broom") showToast("🧹 Get the broom from the closet first!");
  };
  gameLayer.appendChild(crumb);
}

// The broom brushes a crumb: it fades a bit more each time
function brushCrumb(crumb, amount) {
  if (crumb.dirt <= 0) return;
  crumb.dirt -= amount;
  crumb.style.opacity = Math.max(0, crumb.dirt);
  if (crumb.dirt <= 0) {
    const r = crumb.getBoundingClientRect();
    crumb.remove();
    playNotes([520]);
    addStars(STARS.crumb, r.left + r.width / 2, r.top);
  }
}

// ---------- ❗ Kids who need help ----------

function maybeSomeoneNeedsHelp() {
  const waiting = tables.flatMap(t => t.kids).filter(k => !k.need);
  if (waiting.length === 0 || Math.random() < 0.4) return;
  const kid = pick(waiting);
  kid.need = pick(NEEDS);
  const mark = makeEmoji("❗", "need-mark");
  kid.el.appendChild(mark);
  kid.el.classList.add("needs-help");
  playNotes([880, 880]);
}

const popup = document.getElementById("help-popup");
let helping = null;   // the kid we are helping right now

function openHelp(kid) {
  helping = kid;
  document.getElementById("help-kid").textContent = kid.el.firstChild.textContent;
  document.getElementById("help-text").textContent = kid.need.text;

  // The right answer plus 2 wrong ones, mixed up
  const others = shuffle(NEEDS.map(n => n.answer).filter(a => a !== kid.need.answer)).slice(0, 2);
  const choices = document.getElementById("help-choices");
  choices.innerHTML = "";
  shuffle([kid.need.answer, ...others]).forEach(item => {
    const btn = document.createElement("button");
    btn.className = "choice-button";
    btn.textContent = item;
    btn.onclick = event => giveItem(item, btn, event);
    choices.appendChild(btn);
  });

  popup.hidden = false;
  say(kid.need.text);
}

function giveItem(item, btn, event) {
  if (!helping) return;
  if (item === helping.need.answer) {
    // ✅ Helped!
    helping.need = null;
    helping.el.classList.remove("needs-help");
    helping.el.querySelector(".need-mark")?.remove();
    const happy = makeEmoji("💖", "sparkle");
    helping.el.appendChild(happy);
    setTimeout(() => happy.remove(), 900);
    playNotes([523, 659, 784]);
    addStars(STARS.help, event.clientX, event.clientY);
    say("Thank you!");
    closeHelp();
  } else {
    // ❌ Not what they need
    btn.classList.remove("wrong");
    btn.offsetHeight;
    btn.classList.add("wrong");
    playNotes([300, 220]);
    say("That's not what I need!");
  }
}

function closeHelp() {
  popup.hidden = true;
  helping = null;
}

document.getElementById("help-close").onclick = closeHelp;
