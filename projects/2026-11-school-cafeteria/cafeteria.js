// 🏫 DRAWING THE CAFETERIA
// This draws the whole cafeteria picture on the background canvas.
// It redraws itself when the window changes size.

const canvas = document.getElementById("cafeteria");

// 🪑 Where the tables are (as parts of the screen: 0.5 = middle)
const TABLES = [
  { x: 0.04, y: 0.68, food: ["🍕", "🧃"] },
  { x: 0.38, y: 0.74, food: ["🍔", "🍎"] },
  { x: 0.72, y: 0.68, food: ["🥪", "🥛"] },
  { x: 0.2, y: 0.88, food: ["🍝", "🍪"] },
  { x: 0.58, y: 0.9, food: ["🌮", "🍌"] },
];
const TABLE_WIDTH = 0.22;
const TABLE_HEIGHT = 0.07;

// During the game the tables start empty (the game puts kids and food on them)
let drawTableFood = true;
const ctx = canvas.getContext("2d");

function rect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function emoji(char, x, y, size) {
  ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(char, x, y);
}

function drawCafeteria() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = W * ratio;
  canvas.height = H * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const floorY = H * 0.6;   // where the wall ends and the floor starts

  // 🧱 Wall
  rect(0, 0, W, floorY, "#fdf1c7");
  rect(0, floorY - H * 0.12, W, H * 0.12, "#f4a261");   // lower wall stripe
  rect(0, floorY - H * 0.125, W, 6, "#e76f51");

  // 🪟 Windows
  const windowW = W * 0.14;
  const windowH = H * 0.2;
  [0.05, 0.81].forEach(fx => {
    const x = W * fx;
    const y = H * 0.08;
    rect(x - 6, y - 6, windowW + 12, windowH + 12, "#8b5a2b");
    rect(x, y, windowW, windowH, "#a8dcff");
    rect(x + windowW / 2 - 3, y, 6, windowH, "#8b5a2b");
    rect(x, y + windowH / 2 - 3, windowW, 6, "#8b5a2b");
    emoji("☁️", x + windowW * 0.3, y + windowH * 0.28, windowH * 0.25);
    emoji("☀️", x + windowW * 0.75, y + windowH * 0.75, windowH * 0.22);
  });

  // 🕒 Clock
  const clockX = W * 0.5;
  const clockY = H * 0.1;
  const clockR = Math.min(W, H) * 0.05;
  ctx.fillStyle = "white";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX, clockY - clockR * 0.7);
  ctx.moveTo(clockX, clockY);
  ctx.lineTo(clockX + clockR * 0.5, clockY);
  ctx.stroke();

  // 📋 Menu board
  const menuX = W * 0.27;
  const menuY = H * 0.06;
  const menuW = W * 0.16;
  const menuH = H * 0.22;
  rect(menuX - 8, menuY - 8, menuW + 16, menuH + 16, "#8b5a2b");
  rect(menuX, menuY, menuW, menuH, "#2f5d50");
  ctx.fillStyle = "white";
  ctx.font = `bold ${menuH * 0.16}px "Chalkboard SE", "Comic Sans MS", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("MENU", menuX + menuW / 2, menuY + menuH * 0.2);
  emoji("🍕", menuX + menuW * 0.25, menuY + menuH * 0.55, menuH * 0.22);
  emoji("🍔", menuX + menuW * 0.5, menuY + menuH * 0.55, menuH * 0.22);
  emoji("🥗", menuX + menuW * 0.75, menuY + menuH * 0.55, menuH * 0.22);
  emoji("🍎", menuX + menuW * 0.35, menuY + menuH * 0.82, menuH * 0.18);
  emoji("🥛", menuX + menuW * 0.65, menuY + menuH * 0.82, menuH * 0.18);

  // 🍽️ Serving counter along the wall
  const counterY = floorY - H * 0.14;
  rect(W * 0.55, counterY, W * 0.42, H * 0.14, "#adb5bd");
  rect(W * 0.55, counterY, W * 0.42, H * 0.025, "#dee2e6");
  ["🍝", "🌭", "🍟", "🥕", "🍪", "🧃"].forEach((food, i) => {
    emoji(food, W * (0.59 + i * 0.065), counterY - H * 0.015, H * 0.05);
  });

  // ⬜ Checkered floor
  const tile = Math.max(40, W / 24);
  for (let y = floorY; y < H; y += tile) {
    for (let x = 0; x < W; x += tile) {
      const dark = (Math.floor(x / tile) + Math.floor((y - floorY) / tile)) % 2 === 0;
      rect(x, y, tile, tile, dark ? "#d9d9d9" : "#f8f9fa");
    }
  }

  // 🪑 Tables with chairs and lunch
  const tableW = W * TABLE_WIDTH;
  const tableH = H * TABLE_HEIGHT;
  TABLES.forEach(t => {
    const x = W * t.x;
    const y = H * t.y;
    // chairs
    [0.15, 0.45, 0.75].forEach(fx => {
      rect(x + tableW * fx, y - tableH * 0.45, tableW * 0.12, tableH * 0.4, "#e63946");
      rect(x + tableW * fx, y + tableH * 1.05, tableW * 0.12, tableH * 0.4, "#e63946");
    });
    // table top
    ctx.fillStyle = "#c58b4e";
    ctx.beginPath();
    ctx.roundRect(x, y, tableW, tableH, 10);
    ctx.fill();
    // lunch on the table
    if (!drawTableFood) return;
    emoji(t.food[0], x + tableW * 0.3, y + tableH * 0.5, tableH * 0.8);
    emoji(t.food[1], x + tableW * 0.7, y + tableH * 0.5, tableH * 0.8);
  });
}

drawCafeteria();
window.addEventListener("resize", drawCafeteria);
