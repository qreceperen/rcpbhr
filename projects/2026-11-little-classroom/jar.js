// 🫙 THE CLASS REWARD JAR
// Every star drops a marble in the jar. When the jar is full: CLASS PARTY! 🎉

const JAR_SIZE = 20;   // how many marbles fill the jar
const MARBLE_COLORS = ["#ff6b9d", "#6bc5ff", "#ffd166", "#80ed99", "#c77dff", "#ff9f1c"];

let marbles = Number(localStorage.getItem("classroom-jar") || 0);

function jarIsFull() {
  return marbles >= JAR_SIZE;
}

// Draw every jar on the page (there's one on the desk and one in lessons)
function drawJars(dropLast = false) {
  document.querySelectorAll("[data-jar]").forEach(jar => {
    let html = "";
    for (let i = 0; i < marbles; i++) {
      const drop = dropLast && i === marbles - 1 ? "drop" : "";
      html += `<span class="marble ${drop}" style="background:${MARBLE_COLORS[i % MARBLE_COLORS.length]}"></span>`;
    }
    jar.querySelector(".marbles").innerHTML = html;
    jar.classList.toggle("full", jarIsFull());
  });
  document.querySelectorAll("[data-jar-count]").forEach(count => {
    count.textContent = jarIsFull() ? "FULL! Party time! 🎉" : `${marbles} / ${JAR_SIZE}`;
  });
}

function addMarble() {
  if (jarIsFull()) return;
  marbles++;
  localStorage.setItem("classroom-jar", marbles);
  drawJars(true);
}

// ---------- 🎉 The party ----------

function showParty() {
  const party = document.getElementById("party");
  party.hidden = false;

  // Confetti falls from the sky
  const confetti = party.querySelector(".confetti");
  confetti.innerHTML = "";
  const bits = ["🎉", "🎈", "⭐", "🍭", "🎊", "🧁", "💖"];
  for (let i = 0; i < 40; i++) {
    const bit = document.createElement("span");
    bit.textContent = pick(bits);
    bit.style.left = Math.random() * 100 + "%";
    bit.style.animationDelay = Math.random() * 3 + "s";
    bit.style.animationDuration = 2.5 + Math.random() * 2 + "s";
    confetti.appendChild(bit);
  }
  playNotes([523, 523, 784, 784, 880, 880, 784, 0, 698, 698, 659, 659, 587, 587, 523]);
  say("Party time! You filled the whole jar! Hooray!");
}

document.getElementById("empty-jar").onclick = () => {
  marbles = 0;
  localStorage.setItem("classroom-jar", marbles);
  drawJars();
  document.getElementById("party").hidden = true;
  stopTalking();
};

// Click the jar on the desk when it's full to have the party
document.getElementById("desk-jar").onclick = () => {
  if (jarIsFull()) showParty();
};
