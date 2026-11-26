// 👩‍🍳 THE LUNCH LADY
// Hold the arrow keys to walk around the cafeteria:
//   → right    ← left    ↑ forward (further away)    ↓ backward (closer)

const LADY = "👩‍🍳";
const WALK_SPEED = 320;     // how fast she walks (pixels every second)

// Where she can walk (parts of the screen: 0 = top/left, 1 = bottom/right)
const WALK_AREA = { left: 0.03, right: 0.97, top: 0.62, bottom: 0.99 };

const lady = {
  x: 0.5,              // where she is (parts of the screen)
  y: 0.66,
  facingLeft: false,
  el: null,
};

const keysHeld = new Set();   // the arrow keys being held down right now
let lastTime = null;

function startLunchLady() {
  lady.el = document.createElement("div");
  lady.el.className = "lunch-lady";
  lady.el.innerHTML = `<span class="lady-body">${LADY}</span><span class="held-tool" hidden></span>`;
  document.getElementById("game").appendChild(lady.el);
  drawLady();
  requestAnimationFrame(walk);
}

// Put a tool in her hand (like "🧹"), or null for empty hands
function showLadyTool(emoji) {
  const hand = lady.el.querySelector(".held-tool");
  hand.textContent = emoji || "";
  hand.hidden = !emoji;
}

// ---------- Keyboard ----------

const ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

window.addEventListener("keydown", event => {
  if (!ARROWS.includes(event.key)) return;
  event.preventDefault();          // don't scroll the page
  keysHeld.add(event.key);
});

window.addEventListener("keyup", event => {
  keysHeld.delete(event.key);
});

// If the window loses focus, stop walking
window.addEventListener("blur", () => keysHeld.clear());

// ---------- Walking (runs about 60 times every second) ----------

function walk(time) {
  const seconds = lastTime === null ? 0 : (time - lastTime) / 1000;
  lastTime = time;

  // How far to move this time, as parts of the screen
  const stepX = (WALK_SPEED * seconds) / window.innerWidth;
  const stepY = (WALK_SPEED * 0.7 * seconds) / window.innerHeight;

  if (keysHeld.has("ArrowRight")) { lady.x += stepX; lady.facingLeft = false; }
  if (keysHeld.has("ArrowLeft"))  { lady.x -= stepX; lady.facingLeft = true; }
  if (keysHeld.has("ArrowUp"))    { lady.y -= stepY; }   // forward
  if (keysHeld.has("ArrowDown"))  { lady.y += stepY; }   // backward

  // Stay inside the cafeteria
  lady.x = Math.min(WALK_AREA.right, Math.max(WALK_AREA.left, lady.x));
  lady.y = Math.min(WALK_AREA.bottom, Math.max(WALK_AREA.top, lady.y));

  drawLady();
  requestAnimationFrame(walk);
}

function drawLady() {
  // Further away (up) = a bit smaller, closer (down) = a bit bigger
  const depth = (lady.y - WALK_AREA.top) / (WALK_AREA.bottom - WALK_AREA.top);
  const size = 0.8 + depth * 0.4;

  lady.el.style.left = lady.x * 100 + "%";
  lady.el.style.top = lady.y * 100 + "%";
  lady.el.style.transform = `translate(-50%, -100%) scale(${size}) scaleX(${lady.facingLeft ? -1 : 1})`;
  lady.el.style.zIndex = 2 + Math.round(depth * 10);   // closer = in front
  lady.el.classList.toggle("walking", keysHeld.size > 0);
}
