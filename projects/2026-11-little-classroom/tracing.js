// ✏️ TRACE THE LETTER
// A big letter appears. Follow it with your finger (or the mouse)!
// When most of the letter is colored in, you did it.

const LETTERS_TO_TRACE = 5;
const TRACE_COLORS = ["#ff6b9d", "#3a86ff", "#38b000", "#ff9f1c", "#8338ec"];
const ENOUGH_COVERED = 0.65;    // how much of the letter must be colored (0.65 = 65%)
const TOO_MESSY = 0.6;          // if more than 60% of the coloring is OFF the letter, try again

const traceGuide = document.getElementById("trace-guide");   // the gray letter
const traceInk = document.getElementById("trace-ink");       // what the kids draw
const guidePen = traceGuide.getContext("2d");
const inkPen = traceInk.getContext("2d", { willReadFrequently: true });

let traceLetters = [];
let traceIndex = 0;
let letterSpots = [];     // little spots that are ON the letter
let traceLast = null;
let traceDone = false;

function startTracing() {
  showScreen("tracing");
  traceLetters = shuffle(LETTER_WORDS).slice(0, LETTERS_TO_TRACE);
  traceIndex = 0;
  showTraceLetter();
}

function showTraceLetter() {
  const item = traceLetters[traceIndex];
  traceDone = false;
  document.getElementById("trace-progress").textContent = `Letter ${traceIndex + 1} of ${traceLetters.length}`;
  document.getElementById("trace-prompt").textContent = `Trace the letter ${item.letter}! ${item.emoji}`;
  document.getElementById("trace-feedback").textContent = "";

  // Make the canvases as big as their box on the screen
  const size = Math.round(traceGuide.parentElement.getBoundingClientRect().width);
  [traceGuide, traceInk].forEach(canvas => {
    canvas.width = size;
    canvas.height = size;
  });

  // Draw the big gray letter with a dotted edge
  const font = `bold ${Math.round(size * 0.85)}px "Comic Sans MS", "Chalkboard SE", sans-serif`;
  guidePen.clearRect(0, 0, size, size);
  guidePen.font = font;
  guidePen.textAlign = "center";
  guidePen.textBaseline = "alphabetic";
  // Measure the letter so it sits right in the middle of the box
  const box = guidePen.measureText(item.letter);
  const y = size / 2 + (box.actualBoundingBoxAscent - box.actualBoundingBoxDescent) / 2;
  guidePen.fillStyle = "#e3e3e3";
  guidePen.fillText(item.letter, size / 2, y);
  guidePen.setLineDash([size * 0.02, size * 0.02]);
  guidePen.lineWidth = Math.max(2, size * 0.006);
  guidePen.strokeStyle = "#9e9e9e";
  guidePen.strokeText(item.letter, size / 2, y);

  // Remember which little spots are ON the letter (we check every 4th pixel)
  const pixels = guidePen.getImageData(0, 0, size, size).data;
  letterSpots = [];
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      if (pixels[(y * size + x) * 4 + 3] > 0) letterSpots.push(y * size + x);
    }
  }

  inkPen.clearRect(0, 0, size, size);
  inkPen.strokeStyle = TRACE_COLORS[traceIndex % TRACE_COLORS.length];

  // 🧒 Whose turn is it?
  const student = nextTurn();
  showTurn(document.getElementById("trace-turn"), student);
  const turnWords = student ? [{ text: `${student.name}, your turn!`, lang: "en-US" }] : [];
  say([...turnWords, { text: `Trace the letter ${item.letter}! ${item.letter} is for ${item.word}.`, lang: "en-US" }]);
}

// ---------- ✋ Drawing ----------

function inkPoint(event) {
  const box = traceInk.getBoundingClientRect();
  return {
    x: (event.clientX - box.left) * (traceInk.width / box.width),
    y: (event.clientY - box.top) * (traceInk.height / box.height),
  };
}

function inkLine(from, to) {
  inkPen.lineCap = "round";
  inkPen.lineJoin = "round";
  inkPen.lineWidth = traceInk.width * 0.075;
  inkPen.beginPath();
  inkPen.moveTo(from.x, from.y);
  inkPen.lineTo(to.x, to.y);
  inkPen.stroke();
}

traceInk.addEventListener("pointerdown", event => {
  if (traceDone) return;
  traceInk.setPointerCapture(event.pointerId);
  traceLast = inkPoint(event);
  inkLine(traceLast, traceLast);
});
traceInk.addEventListener("pointermove", event => {
  if (!traceLast) return;
  const point = inkPoint(event);
  inkLine(traceLast, point);
  traceLast = point;
});
traceInk.addEventListener("pointerup", () => {
  if (!traceLast) return;
  traceLast = null;
  checkTrace(false);
});
traceInk.addEventListener("pointercancel", () => (traceLast = null));

// ---------- ✔ Is the letter traced? ----------

function checkTrace(pressedDone) {
  if (traceDone) return;
  const size = traceInk.width;
  const ink = inkPen.getImageData(0, 0, size, size).data;

  // How much of the letter is colored?
  // A spot counts if there is ink ON it or very NEAR it (little fingers aren't exact!)
  const near = Math.round(size * 0.05);
  const hasInk = (x, y) => x >= 0 && y >= 0 && x < size && y < size && ink[(y * size + x) * 4 + 3] > 0;
  let covered = 0;
  letterSpots.forEach(spot => {
    const x = spot % size;
    const y = Math.floor(spot / size);
    if (hasInk(x, y) || hasInk(x - near, y) || hasInk(x + near, y) || hasInk(x, y - near) || hasInk(x, y + near)) covered++;
  });
  const coveredPart = covered / letterSpots.length;

  // How much coloring is OFF the letter?
  const onLetter = new Set(letterSpots);
  let inkSpots = 0;
  let offSpots = 0;
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const spot = y * size + x;
      if (ink[spot * 4 + 3] > 0) {
        inkSpots++;
        if (!onLetter.has(spot)) offSpots++;
      }
    }
  }
  const messyPart = inkSpots ? offSpots / inkSpots : 0;
  const feedback = document.getElementById("trace-feedback");

  if (coveredPart >= ENOUGH_COVERED && messyPart <= TOO_MESSY) {
    traceDone = true;
    earnStar();
    const item = traceLetters[traceIndex];
    feedback.textContent = `🎉 ${pick(PRAISE)} ${item.letter} is for ${item.word}! ${item.emoji}`;
    happySound();
    if (!playVoice("goodJob")) say(`${pick(PRAISE)} ${item.letter} is for ${item.word}!`);
    setTimeout(() => {
      if (document.getElementById("tracing").hidden) return;
      traceIndex++;
      if (traceIndex < traceLetters.length) showTraceLetter();
      else finishLesson();
    }, 2200);
  } else if (messyPart > TOO_MESSY && inkSpots > letterSpots.length * 0.3) {
    feedback.textContent = "Try to stay on the letter! Press 🧽 to start over.";
  } else if (pressedDone) {
    feedback.textContent = "Keep going! Color in ALL of the letter. ✏️";
    say("Keep going!");
  }
}

document.getElementById("trace-clear").onclick = () => {
  if (traceDone) return;
  inkPen.clearRect(0, 0, traceInk.width, traceInk.height);
  document.getElementById("trace-feedback").textContent = "";
};
document.getElementById("trace-check").onclick = () => checkTrace(true);

LESSONS.tracing = {
  title: "Trace the Letter",
  icon: "✏️",
  group: "game",
  start: startTracing,
};
