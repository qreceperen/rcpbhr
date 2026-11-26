// 🫧 RECESS TIME!
// A short break between lessons: pop as many bubbles as you can!

const RECESS_SECONDS = 30;
const BUBBLE_TREATS = ["", "", "", "⭐", "🐟", "🍬", "🦋"];   // some bubbles have a surprise inside

let recessTimer = null;
let bubbleMaker = null;
let popped = 0;

function startRecess() {
  showScreen("recess");
  stopRecess();
  popped = 0;
  let secondsLeft = RECESS_SECONDS;
  const sky = document.getElementById("bubble-sky");
  sky.innerHTML = "";
  document.getElementById("recess-over").hidden = true;
  document.getElementById("popped").textContent = popped;
  document.getElementById("recess-time").textContent = secondsLeft;
  say("Recess time! Pop the bubbles!");

  bubbleMaker = setInterval(makeBubble, 600);
  recessTimer = setInterval(() => {
    secondsLeft--;
    document.getElementById("recess-time").textContent = secondsLeft;
    if (secondsLeft <= 0) endRecess();
  }, 1000);
}

function makeBubble() {
  const sky = document.getElementById("bubble-sky");
  const bubble = document.createElement("button");
  bubble.className = "bubble";
  bubble.textContent = pick(BUBBLE_TREATS);
  const size = randomInt(60, 110);
  bubble.style.width = size + "px";
  bubble.style.height = size + "px";
  bubble.style.left = `calc(${Math.random() * 100}% - ${size / 2}px)`;
  sky.appendChild(bubble);

  // Float up from the bottom to the top, wiggling a little
  const height = sky.clientHeight + size + 120;   // from below the bottom to above the top
  const wiggle = randomInt(-40, 40);
  const time = randomInt(4500, 7000);
  bubble.animate([
    { transform: "translate(0, 0)" },
    { transform: `translate(${wiggle}px, ${-height / 2}px)` },
    { transform: `translate(${-wiggle}px, ${-height}px)` },
  ], { duration: time, easing: "linear", fill: "forwards" });
  setTimeout(() => bubble.remove(), time);

  bubble.onpointerdown = () => {
    popped++;
    document.getElementById("popped").textContent = popped;
    playNotes([randomInt(700, 1100)]);
    bubble.onpointerdown = null;
    bubble.classList.add("pop");
    setTimeout(() => bubble.remove(), 200);
  };
}

function endRecess() {
  stopRecess();
  document.getElementById("recess-over").hidden = false;
  document.getElementById("recess-result").textContent = `You popped ${popped} bubble${popped === 1 ? "" : "s"}! 🫧`;
  playNotes([784, 659, 784, 659, 784]);   // the school bell
  say(`Recess is over! You popped ${popped} bubbles! Back to class!`);
}

function stopRecess() {
  clearInterval(recessTimer);
  clearInterval(bubbleMaker);
}

leaveJobs.push(stopRecess);

LESSONS.recess = {
  title: "Recess Time",
  icon: "🫧",
  group: "game",
  start: startRecess,
};
