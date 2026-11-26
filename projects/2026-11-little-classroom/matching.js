// 🃏 MATCHING PAIRS
// Turn over two cards. If they match, they stay open! Find all the pairs.

const MATCH_PICTURES = ["🐶", "🐱", "🦁", "🐸", "🐵", "🐼", "🍎", "🍌", "🍓", "⭐", "🌈", "🚗", "🎈", "🦋"];
const PAIRS = 6;

let openCards = [];   // the cards turned over right now (0, 1 or 2)
let pairsLeft = 0;

function startMatching() {
  showScreen("matching");
  const grid = document.getElementById("match-grid");
  grid.innerHTML = "";
  openCards = [];
  pairsLeft = PAIRS;

  const pictures = shuffle(MATCH_PICTURES).slice(0, PAIRS);
  shuffle([...pictures, ...pictures]).forEach(picture => {
    const card = document.createElement("button");
    card.className = "match-card";
    card.dataset.picture = picture;
    card.innerHTML = `<span class="card-back">❓</span><span class="card-front">${picture}</span>`;
    card.onclick = () => flipCard(card);
    grid.appendChild(card);
  });
  document.getElementById("match-feedback").textContent = "";
  say("Find the pairs that match! Turn over two cards.");
}

function flipCard(card) {
  if (openCards.length === 2 || card.classList.contains("flipped")) return;
  card.classList.add("flipped");
  playNotes([660]);
  openCards.push(card);
  if (openCards.length < 2) return;

  const [a, b] = openCards;
  const feedback = document.getElementById("match-feedback");
  if (a.dataset.picture === b.dataset.picture) {
    // 🎉 A match!
    setTimeout(() => {
      a.classList.add("matched");
      b.classList.add("matched");
      openCards = [];
      earnStar();
      pairsLeft--;
      feedback.textContent = `🎉 A match! ${a.dataset.picture}${b.dataset.picture}`;
      happySound();
      if (!playVoice("goodJob")) say(pick(PRAISE) + " That's a match!");
      if (pairsLeft === 0) setTimeout(() => {
        if (!document.getElementById("matching").hidden) finishLesson();
      }, 1800);
    }, 400);
  } else {
    // Not a match: turn them back over
    feedback.textContent = "Not a match. Try again! 💪";
    setTimeout(() => {
      a.classList.remove("flipped");
      b.classList.remove("flipped");
      openCards = [];
    }, 1100);
  }
}

LESSONS.matching = {
  title: "Matching Pairs",
  icon: "🃏",
  group: "game",
  start: startMatching,
};
