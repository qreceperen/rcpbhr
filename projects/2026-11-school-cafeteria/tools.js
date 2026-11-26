// 🚪 THE CLOSET AND THE TOOLS
//   1. Click the closet → the door opens
//   2. Click a tool inside → the lunch lady holds it
//        🧹 broom  → click and drag on the FLOOR to sweep the crumbs
//        🧽 sponge → click and drag on a messy TABLE to wipe it clean
//   She holds one tool at a time. Click the closet again to put it back.

const TOOLS = {
  broom: {
    emoji: "🧹",
    hint: "🧹 Click and drag on the floor to sweep!",
    reach: 70,          // how far the tool reaches (pixels)
    strength: 0.12,     // how much the dirt fades each time it is brushed
  },
  sponge: {
    emoji: "🧽",
    hint: "🧽 Click and drag on a messy table to wipe it!",
    reach: 60,
    strength: 0.1,
  },
};

const closet = document.getElementById("closet");
const dragTool = document.getElementById("drag-tool");

let heldTool = null;     // "broom", "sponge", or null (nothing in her hands)
let usingTool = false;   // true while the mouse button is held down

// ---------- 🚪 The closet ----------

closet.addEventListener("click", event => {
  if (event.target.closest(".closet-tool")) return;   // tools have their own click

  if (heldTool) {
    putToolBack();
    closet.classList.add("open");
    setTimeout(() => closet.classList.remove("open"), 700);
    showToast("🚪 Put back in the closet.");
    return;
  }

  closet.classList.toggle("open");
  playNotes([330, 392]);   // creak!
});

// ---------- Taking a tool ----------

document.querySelectorAll(".closet-tool").forEach(toolEl => {
  toolEl.addEventListener("click", event => {
    event.stopPropagation();
    putToolBack();                       // only one tool at a time
    heldTool = toolEl.dataset.tool;
    toolEl.hidden = true;
    showLadyTool(TOOLS[heldTool].emoji);
    playNotes([523, 784]);
    setTimeout(() => closet.classList.remove("open"), 300);
    showToast(TOOLS[heldTool].hint);
  });
});

function putToolBack() {
  if (!heldTool) return;
  document.querySelector(`.closet-tool[data-tool="${heldTool}"]`).hidden = false;
  heldTool = null;
  showLadyTool(null);
}

// ---------- Using the tool (click and drag) ----------

function canUseToolHere(event) {
  if (!heldTool) return false;
  if (!document.getElementById("help-popup").hidden) return false;
  if (event.target.closest(".closet, .kid, button, a")) return false;
  // The broom only works on the floor; the sponge works on tables too
  return event.clientY > window.innerHeight * 0.55;
}

window.addEventListener("pointerdown", event => {
  if (!canUseToolHere(event)) return;
  event.preventDefault();
  usingTool = true;
  showLadyTool(null);                    // the tool leaves her hand while you use it
  dragTool.textContent = TOOLS[heldTool].emoji;
  dragTool.hidden = false;
  useToolAt(event.clientX, event.clientY);
});

window.addEventListener("pointermove", event => {
  if (usingTool) useToolAt(event.clientX, event.clientY);
});

function stopUsingTool() {
  if (!usingTool) return;
  usingTool = false;
  dragTool.hidden = true;
  if (heldTool) showLadyTool(TOOLS[heldTool].emoji);   // back in her hand
}
window.addEventListener("pointerup", stopUsingTool);
window.addEventListener("pointercancel", stopUsingTool);

// Is this thing close to the tool?
function isNear(el, x, y, reach) {
  const r = el.getBoundingClientRect();
  return Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y) < reach;
}

function useToolAt(x, y) {
  dragTool.style.left = x + "px";
  dragTool.style.top = y + "px";
  const tool = TOOLS[heldTool];

  if (heldTool === "broom") {
    // 🧹 Sweep crumbs on the floor
    document.querySelectorAll(".crumb").forEach(crumb => {
      if (isNear(crumb, x, y, tool.reach)) brushCrumb(crumb, tool.strength);
    });
  }

  if (heldTool === "sponge") {
    // 🧽 Wipe the mess on messy tables
    tables.filter(t => t.state === "messy").forEach(table => {
      table.spot.querySelectorAll(".mess").forEach(mess => {
        if (isNear(mess, x, y, tool.reach)) wipeMess(table, mess, tool.strength);
      });
    });
  }
}
