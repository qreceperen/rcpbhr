// 🧩 PICTURE PUZZLE
// Pick a picture, then drag the pieces onto the board to finish it.

const PICTURE_WIDTH = 800;
const PICTURE_HEIGHT = 600;

let cols = 2;
let rows = 2;
const TRAY_SCALE = 0.55;   // pieces wait in the tray a bit smaller

let currentImage = null;   // the picture we are playing with (as an image URL)
let placedCount = 0;
let boardW, boardH, pieceW, pieceH, tabSize, margin;

const board = document.getElementById("board");
const tray = document.getElementById("tray");
const message = document.getElementById("message");
const counter = document.getElementById("counter");
const ghost = document.getElementById("ghost");
const helperButton = document.getElementById("helper-button");

// 👻 The helper picture: a faint copy of the picture on the board
let helperOn = false;

function showHelper(on) {
  helperOn = on;
  ghost.classList.toggle("off", !on);
  helperButton.classList.toggle("on", on);
  helperButton.textContent = on ? "👻 Helper: ON" : "👻 Helper: OFF";
}

helperButton.onclick = () => showHelper(!helperOn);

// ---------- Talking and sounds ----------

function say(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.rate = 0.9;
  voice.pitch = 1.1;
  speechSynthesis.speak(voice);
}

let audio;
function playNotes(notes) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    notes.forEach((freq, i) => {
      const start = audio.currentTime + i * 0.12;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch (e) {
    // No sound available, that's okay
  }
}

// ---------- Screens ----------

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => (s.hidden = s.id !== id));
}

// ---------- Choosing ----------

// Draw each built-in picture and make a button for it
function makePictureImage(picture) {
  const canvas = document.createElement("canvas");
  canvas.width = PICTURE_WIDTH;
  canvas.height = PICTURE_HEIGHT;
  picture.draw(canvas.getContext("2d"));
  return canvas.toDataURL();
}

PICTURES.forEach(picture => {
  const url = makePictureImage(picture);
  const btn = document.createElement("button");
  btn.className = "picture-choice";
  btn.innerHTML = `<img src="${url}" alt="${picture.name}">${picture.name}`;
  btn.onclick = () => startPuzzle(url);
  document.getElementById("pictures").appendChild(btn);
});

// Number of pieces buttons
document.querySelectorAll("#sizes button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#sizes button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    cols = Number(btn.dataset.cols);
    rows = Number(btn.dataset.rows);
  };
});

// Use your own picture: crop it to the puzzle shape (4:3)
document.getElementById("upload").onchange = event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PICTURE_WIDTH;
      canvas.height = PICTURE_HEIGHT;
      const scale = Math.max(PICTURE_WIDTH / img.width, PICTURE_HEIGHT / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      canvas.getContext("2d").drawImage(img, (PICTURE_WIDTH - w) / 2, (PICTURE_HEIGHT - h) / 2, w, h);
      startPuzzle(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  event.target.value = ""; // so the same picture can be chosen again
};


// ---------- Building the puzzle ----------

function startPuzzle(imageUrl) {
  currentImage = imageUrl;
  // Load the picture first, then cut it into pieces
  const img = new Image();
  img.onload = () => buildPuzzle(img);
  img.src = imageUrl;
}

function buildPuzzle(img) {
  placedCount = 0;
  showScreen("play");

  // Make the board fit the screen, leaving room for the tray underneath
  const fitWidth = window.innerWidth - 60;
  const fitHeight = (window.innerHeight - 140) / (1 + TRAY_SCALE * 1.6);
  boardW = Math.max(280, Math.min(600, fitWidth, fitHeight * PICTURE_WIDTH / PICTURE_HEIGHT));
  boardH = Math.round(boardW * PICTURE_HEIGHT / PICTURE_WIDTH);
  pieceW = boardW / cols;
  pieceH = boardH / rows;
  tabSize = Math.min(pieceW, pieceH) * 0.28;   // how far the bumps stick out
  margin = Math.ceil(tabSize) + 2;             // extra room around each piece for bumps

  const edges = makeEdges(rows, cols);

  board.style.width = boardW + "px";
  board.style.height = boardH + "px";
  board.classList.remove("done");
  board.querySelectorAll(".slot, .piece, .outlines").forEach(el => el.remove());
  ghost.style.backgroundImage = `url(${img.src})`;
  showHelper(helperOn);
  helperButton.hidden = false;

  // Dashed outlines on the board show where every piece goes
  board.appendChild(drawOutlines(edges));

  tray.innerHTML = "";
  document.getElementById("win-buttons").hidden = true;
  message.textContent = "Drag the pieces onto the board!";
  updateCounter();

  const pieces = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `${r}-${c}`;

      // The spot on the board (invisible, used to check where a piece is dropped)
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.id = id;
      Object.assign(slot.style, {
        left: c * pieceW + "px",
        top: r * pieceH + "px",
        width: pieceW + "px",
        height: pieceH + "px",
      });
      board.appendChild(slot);

      // The piece: its part of the picture, cut out in a jigsaw shape
      const piece = drawPiece(img, pieceSides(edges, r, c), r, c);
      piece.className = "piece";
      piece.dataset.id = id;
      piece.dataset.row = r;
      piece.dataset.col = c;
      sizePiece(piece, TRAY_SCALE);
      makeDraggable(piece);
      pieces.push(piece);
    }
  }

  shuffle(pieces).forEach(p => tray.appendChild(p));
  say("Let's finish the picture!");
}

// Sharper drawing on high-resolution screens (like iPads and Macs)
const PIXEL_RATIO = window.devicePixelRatio || 1;

// Cut one piece out of the picture, with its jigsaw edges
function drawPiece(img, sides, r, c) {
  const fullW = pieceW + margin * 2;
  const fullH = pieceH + margin * 2;
  const canvas = document.createElement("canvas");
  canvas.width = fullW * PIXEL_RATIO;
  canvas.height = fullH * PIXEL_RATIO;
  const ctx = canvas.getContext("2d");
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO);

  const shape = piecePath(sides, margin, margin, pieceW, pieceH, tabSize);
  ctx.save();
  ctx.clip(shape);
  // Draw the whole picture, shifted so this piece's part lines up
  ctx.drawImage(img, margin - c * pieceW, margin - r * pieceH, boardW, boardH);
  ctx.restore();

  // A thin edge line so the shape is easy to see
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.stroke(shape);
  return canvas;
}

// Dashed outlines of every piece, drawn on the board
function drawOutlines(edges) {
  const canvas = document.createElement("canvas");
  canvas.className = "outlines";
  canvas.width = boardW * PIXEL_RATIO;
  canvas.height = boardH * PIXEL_RATIO;
  canvas.style.width = boardW + "px";
  canvas.style.height = boardH + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
  ctx.setLineDash([6, 5]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.stroke(piecePath(pieceSides(edges, r, c), c * pieceW, r * pieceH, pieceW, pieceH, tabSize));
    }
  }
  return canvas;
}

// Make a piece bigger or smaller (1 = the real size on the board)
function sizePiece(piece, scale) {
  piece.style.width = (pieceW + margin * 2) * scale + "px";
  piece.style.height = (pieceH + margin * 2) * scale + "px";
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function updateCounter() {
  counter.textContent = `${placedCount} of ${cols * rows} pieces`;
}

// ---------- Dragging (works with mouse AND touch) ----------

function makeDraggable(piece) {
  piece.addEventListener("pointerdown", event => {
    if (piece.classList.contains("placed")) return;
    event.preventDefault();

    // Remember where on the piece the finger grabbed it
    const rect = piece.getBoundingClientRect();
    const grabX = (event.clientX - rect.left) / rect.width * (pieceW + margin * 2);
    const grabY = (event.clientY - rect.top) / rect.height * (pieceH + margin * 2);

    // Lift the piece up, grow it to full size, and let it float over everything
    document.body.appendChild(piece);
    piece.classList.add("dragging");
    sizePiece(piece, 1);
    Object.assign(piece.style, {
      position: "fixed",
      left: event.clientX - grabX + "px",
      top: event.clientY - grabY + "px",
    });

    function move(e) {
      piece.style.left = e.clientX - grabX + "px";
      piece.style.top = e.clientY - grabY + "px";
      highlightSlotUnder(piece);
    }

    function drop() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("pointercancel", drop);
      piece.classList.remove("dragging");
      clearHighlight();
      tryToPlace(piece);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", drop);
  });
}

// Which slot is under the middle of the piece?
function slotUnder(piece) {
  const r = piece.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  return [...board.querySelectorAll(".slot")].find(slot => {
    const s = slot.getBoundingClientRect();
    return x >= s.left && x <= s.right && y >= s.top && y <= s.bottom;
  });
}

function highlightSlotUnder(piece) {
  clearHighlight();
  const slot = slotUnder(piece);
  if (slot) slot.classList.add("hover");
}

function clearHighlight() {
  board.querySelectorAll(".slot.hover").forEach(s => s.classList.remove("hover"));
}

function tryToPlace(piece) {
  const slot = slotUnder(piece);

  if (slot && slot.dataset.id === piece.dataset.id) {
    // ✅ Right spot! Snap it in.
    piece.classList.add("placed");
    const c = Number(piece.dataset.col);
    const r = Number(piece.dataset.row);
    Object.assign(piece.style, {
      position: "",
      left: c * pieceW - margin + "px",   // the bumps hang over the neighbors
      top: r * pieceH - margin + "px",
    });
    board.appendChild(piece);
    placedCount++;
    updateCounter();
    playNotes([523, 784]);

    if (placedCount === cols * rows) {
      win();
    } else {
      message.textContent = pick(["Nice! 👍", "Yes! ⭐", "Great! 🎉", "Good job! 😊"]);
    }
  } else {
    // ❌ Not here, back to the tray
    Object.assign(piece.style, { position: "", left: "", top: "" });
    sizePiece(piece, TRAY_SCALE);
    tray.appendChild(piece);
    if (slot) {
      piece.classList.remove("wiggle");
      piece.offsetHeight; // restart the wiggle animation
      piece.classList.add("wiggle");
      message.textContent = "Hmm, not there. Try another spot! 🤔";
      playNotes([300, 220]);
    }
  }
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// 🎤 Our own recorded celebration voice!
const celebrationVoice = new Audio("assets/celebration.m4a");

function win() {
  board.classList.add("done");
  ghost.classList.add("off");     // the real picture is finished, no helper needed
  helperButton.hidden = true;
  message.textContent = "🎉 You did it! The picture is finished! 🎉";
  document.getElementById("win-buttons").hidden = false;
  playNotes([523, 659, 784, 1047]);

  // Play our recording. If it can't play, the computer voice says it instead.
  celebrationVoice.currentTime = 0;
  celebrationVoice.play().catch(() => say("Hooray! You finished the picture!"));
}

// ---------- Buttons ----------

document.getElementById("back").onclick = () => showScreen("choose");
document.getElementById("new-picture").onclick = () => showScreen("choose");
document.getElementById("again").onclick = () => startPuzzle(currentImage);
