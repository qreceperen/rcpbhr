// 🌳🌊 SORTING GAME: Land or Sea?
// Drag each animal into the right box. The whole class plays together.

const SORT_BOXES = [
  { key: "land", label: "🌳 Land" },
  { key: "sea", label: "🌊 Sea" },
];
const SORT_ANIMALS = [
  { emoji: "🐄", name: "cow", home: "land" },
  { emoji: "🐘", name: "elephant", home: "land" },
  { emoji: "🦁", name: "lion", home: "land" },
  { emoji: "🐰", name: "bunny", home: "land" },
  { emoji: "🐒", name: "monkey", home: "land" },
  { emoji: "🐻", name: "bear", home: "land" },
  { emoji: "🐴", name: "horse", home: "land" },
  { emoji: "🐙", name: "octopus", home: "sea" },
  { emoji: "🐳", name: "whale", home: "sea" },
  { emoji: "🐠", name: "fish", home: "sea" },
  { emoji: "🦀", name: "crab", home: "sea" },
  { emoji: "🐬", name: "dolphin", home: "sea" },
  { emoji: "🦈", name: "shark", home: "sea" },
  { emoji: "🦑", name: "squid", home: "sea" },
];
const ANIMALS_PER_BOX = 3;

let sortLeft = 0;   // animals still waiting

function startSorting() {
  showScreen("sorting");
  const tray = document.getElementById("sort-tray");
  const boxes = document.getElementById("sort-boxes");
  tray.innerHTML = "";
  boxes.innerHTML = "";

  SORT_BOXES.forEach(box => {
    boxes.innerHTML += `<div class="sort-box ${box.key}" data-box="${box.key}">
      <div class="sort-label">${box.label}</div><div class="sort-inside"></div></div>`;
  });

  // Pick 3 land animals and 3 sea animals, all mixed up
  const animals = shuffle(SORT_BOXES.flatMap(box =>
    shuffle(SORT_ANIMALS.filter(a => a.home === box.key)).slice(0, ANIMALS_PER_BOX)));
  sortLeft = animals.length;
  animals.forEach(animal => {
    const el = document.createElement("div");
    el.className = "sort-animal";
    el.textContent = animal.emoji;
    el.firstTry = true;
    el.animal = animal;
    makeDraggable(el);
    tray.appendChild(el);
  });
  document.getElementById("sort-feedback").textContent = "";
  say("Help the animals go home! Drag each animal to the land or the sea.");
}

// ✋ Drag with a finger or the mouse
function makeDraggable(el) {
  let start = null;
  el.addEventListener("pointerdown", event => {
    if (el.done) return;
    el.setPointerCapture(event.pointerId);
    start = { x: event.clientX, y: event.clientY };
    el.classList.add("dragging");
  });
  el.addEventListener("pointermove", event => {
    if (!start) return;
    el.style.transform = `translate(${event.clientX - start.x}px, ${event.clientY - start.y}px) scale(1.2)`;
  });
  el.addEventListener("pointerup", event => {
    if (!start) return;
    start = null;
    el.classList.remove("dragging");
    // Which box is under the finger? (hide the animal for a moment to look under it)
    el.style.visibility = "hidden";
    const under = document.elementFromPoint(event.clientX, event.clientY);
    el.style.visibility = "";
    const box = under && under.closest("[data-box]");
    dropAnimal(el, box);
  });
  el.addEventListener("pointercancel", () => {
    start = null;
    el.classList.remove("dragging");
    el.style.transform = "";
  });
}

function dropAnimal(el, box) {
  const feedback = document.getElementById("sort-feedback");
  el.style.transform = "";   // it snaps back... unless it goes in a box
  if (!box) return;

  const animal = el.animal;
  if (box.dataset.box === animal.home) {
    el.done = true;
    box.querySelector(".sort-inside").appendChild(el);
    if (el.firstTry) earnStar();
    const where = animal.home === "sea" ? "in the sea" : "on land";
    feedback.textContent = `🎉 Yes! The ${animal.name} lives ${where}!`;
    happySound();
    if (!playVoice("goodJob")) say(`Yes! The ${animal.name} lives ${where}!`);
    sortLeft--;
    if (sortLeft === 0) setTimeout(() => {
      if (!document.getElementById("sorting").hidden) finishLesson();
    }, 1800);
  } else {
    el.firstTry = false;
    el.classList.remove("nope");
    el.offsetHeight;
    el.classList.add("nope");
    feedback.textContent = "Oops! Try again 💪";
    oopsSound();
    if (!playVoice("tryAgain")) say("Oops! Try again!");
  }
}

LESSONS.sorting = {
  title: "Land or Sea?",
  icon: "🌊",
  group: "game",
  start: startSorting,
};
