// 🖍️ THE TEACHER'S CHALKBOARD
// Draw or write on the board with your finger or the mouse.

const CHALK_COLORS = ["#ffffff", "#ffe066", "#ff8fab", "#8ecae6", "#95d5b2"];

const board = document.getElementById("board");
const boardPen = board.getContext("2d");
let chalkColor = CHALK_COLORS[0];
let erasing = false;
let thick = false;
let lastPoint = null;

// Make the board's pixels match its size on the screen (keeps the drawing)
function sizeBoard() {
  const box = board.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  const width = Math.round(box.width * scale);
  const height = Math.round(box.height * scale);
  if (!width || (board.width === width && board.height === height)) return;
  const old = document.createElement("canvas");
  old.width = board.width;
  old.height = board.height;
  old.getContext("2d").drawImage(board, 0, 0);
  board.width = width;
  board.height = height;
  boardPen.drawImage(old, 0, 0, width, height);
}

function boardPoint(event) {
  const box = board.getBoundingClientRect();
  return {
    x: (event.clientX - box.left) * (board.width / box.width),
    y: (event.clientY - box.top) * (board.height / box.height),
  };
}

function drawLine(from, to) {
  const scale = board.width / board.getBoundingClientRect().width;
  boardPen.lineCap = "round";
  boardPen.lineJoin = "round";
  if (erasing) {
    boardPen.globalCompositeOperation = "destination-out";   // rubs the chalk away
    boardPen.lineWidth = 40 * scale;
  } else {
    boardPen.globalCompositeOperation = "source-over";
    boardPen.strokeStyle = chalkColor;
    boardPen.globalAlpha = 0.9;                              // a little see-through, like chalk
    boardPen.lineWidth = (thick ? 14 : 6) * scale;
  }
  boardPen.beginPath();
  boardPen.moveTo(from.x, from.y);
  boardPen.lineTo(to.x, to.y);
  boardPen.stroke();
  boardPen.globalAlpha = 1;
}

board.addEventListener("pointerdown", event => {
  board.setPointerCapture(event.pointerId);
  lastPoint = boardPoint(event);
  drawLine(lastPoint, lastPoint);   // a dot
});
board.addEventListener("pointermove", event => {
  if (!lastPoint) return;
  const point = boardPoint(event);
  drawLine(lastPoint, point);
  lastPoint = point;
});
board.addEventListener("pointerup", () => (lastPoint = null));
board.addEventListener("pointercancel", () => (lastPoint = null));

// ---------- 🧰 The chalk tray ----------

function drawChalkTray() {
  const tray = document.getElementById("chalk-tray");
  tray.innerHTML = "";
  CHALK_COLORS.forEach(color => {
    const chalk = document.createElement("button");
    chalk.className = "chalk" + (!erasing && color === chalkColor ? " picked" : "");
    chalk.style.background = color;
    chalk.title = "Chalk";
    chalk.onclick = () => {
      chalkColor = color;
      erasing = false;
      drawChalkTray();
    };
    tray.appendChild(chalk);
  });
  const tools = [
    { text: thick ? "✏️ Thin" : "🖌️ Thick", click: () => (thick = !thick) },
    { text: "🧽 Eraser", picked: erasing, click: () => (erasing = !erasing) },
    { text: "🧹 Clean board", click: () => boardPen.clearRect(0, 0, board.width, board.height) },
  ];
  tools.forEach(tool => {
    const btn = document.createElement("button");
    btn.className = "small tray-tool" + (tool.picked ? " picked" : "");
    btn.textContent = tool.text;
    btn.onclick = () => {
      tool.click();
      drawChalkTray();
    };
    tray.appendChild(btn);
  });
}

document.getElementById("open-chalkboard").onclick = () => {
  showScreen("chalkboard");
  sizeBoard();
  drawChalkTray();
};
window.addEventListener("resize", () => {
  if (!document.getElementById("chalkboard").hidden) sizeBoard();
});
