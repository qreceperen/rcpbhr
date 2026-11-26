// 🏫 LITTLE CLASSROOM
// The teacher picks a lesson, the class answers questions and earns stars.
// This file is the main part. Other files add more lessons, games and tools:
//   more-lessons.js  → Animals, Opposites, Bigger or Smaller, Patterns, Math, Feelings, Time
//   students.js      → student names and turns
//   voice.js         → the teacher's own recorded voice
//   jar.js           → the class reward jar and the party
//   chalkboard.js    → the teacher's chalkboard for drawing
//   sorting.js, matching.js, tracing.js, recess.js → the games
//   desk.js          → builds the desk (it runs last)

const QUESTIONS_PER_LESSON = 5;

// ---------- The lesson ingredients ----------

const COUNT_THINGS = [
  { emoji: "🍎", name: "apples" },
  { emoji: "⭐", name: "stars" },
  { emoji: "🐟", name: "fish" },
  { emoji: "🎈", name: "balloons" },
  { emoji: "🐞", name: "ladybugs" },
  { emoji: "🌸", name: "flowers" },
  { emoji: "🚗", name: "cars" },
  { emoji: "🧁", name: "cupcakes" },
];

const LETTER_WORDS = [
  { letter: "A", word: "apple", emoji: "🍎" },
  { letter: "B", word: "banana", emoji: "🍌" },
  { letter: "C", word: "cat", emoji: "🐱" },
  { letter: "D", word: "dog", emoji: "🐶" },
  { letter: "E", word: "elephant", emoji: "🐘" },
  { letter: "F", word: "fish", emoji: "🐟" },
  { letter: "G", word: "grapes", emoji: "🍇" },
  { letter: "H", word: "house", emoji: "🏠" },
  { letter: "I", word: "ice cream", emoji: "🍦" },
  { letter: "K", word: "kite", emoji: "🪁" },
  { letter: "L", word: "lion", emoji: "🦁" },
  { letter: "M", word: "moon", emoji: "🌙" },
  { letter: "O", word: "orange", emoji: "🍊" },
  { letter: "P", word: "pig", emoji: "🐷" },
  { letter: "Q", word: "queen", emoji: "👸" },
  { letter: "R", word: "rainbow", emoji: "🌈" },
  { letter: "S", word: "sun", emoji: "☀️" },
  { letter: "T", word: "tiger", emoji: "🐯" },
  { letter: "U", word: "umbrella", emoji: "☂️" },
  { letter: "W", word: "whale", emoji: "🐳" },
  { letter: "Z", word: "zebra", emoji: "🦓" },
];

const COLORS = [
  { name: "red", css: "#ff3b3b" },
  { name: "orange", css: "#ff9f1c" },
  { name: "yellow", css: "#ffd60a" },
  { name: "green", css: "#38b000" },
  { name: "blue", css: "#3a86ff" },
  { name: "purple", css: "#8338ec" },
  { name: "pink", css: "#ff70a6" },
  { name: "brown", css: "#8b5a2b" },
  { name: "black", css: "#222222" },
];

const SHAPES = [
  { name: "circle", emoji: "🔵" },
  { name: "square", emoji: "🟩" },
  { name: "triangle", emoji: "🔺" },
  { name: "star", emoji: "⭐" },
  { name: "heart", emoji: "❤️" },
  { name: "diamond", emoji: "🔶" },
];

const TURKISH_WORDS = [
  { turkish: "kedi", english: "cat", emoji: "🐱" },
  { turkish: "köpek", english: "dog", emoji: "🐶" },
  { turkish: "kuş", english: "bird", emoji: "🐦" },
  { turkish: "balık", english: "fish", emoji: "🐟" },
  { turkish: "elma", english: "apple", emoji: "🍎" },
  { turkish: "muz", english: "banana", emoji: "🍌" },
  { turkish: "süt", english: "milk", emoji: "🥛" },
  { turkish: "su", english: "water", emoji: "💧" },
  { turkish: "ev", english: "house", emoji: "🏠" },
  { turkish: "araba", english: "car", emoji: "🚗" },
  { turkish: "top", english: "ball", emoji: "⚽" },
  { turkish: "kitap", english: "book", emoji: "📖" },
  { turkish: "güneş", english: "sun", emoji: "☀️" },
  { turkish: "ay", english: "moon", emoji: "🌙" },
  { turkish: "ağaç", english: "tree", emoji: "🌳" },
  { turkish: "çiçek", english: "flower", emoji: "🌸" },
];

const PRAISE = ["Great job!", "Well done!", "Super!", "You're so smart!", "Amazing!", "Yes!"];
const STICKERS = ["🦄", "🐼", "🦋", "🌟", "🐬", "🦊", "🌈", "🍭", "🐝", "🦁"];

// ---------- Little helpers ----------

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[randomInt(0, list.length - 1)];
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Pick `count` different items from a list, skipping `skip`
function pickOthers(list, count, skip) {
  return shuffle(list.filter(item => item !== skip)).slice(0, count);
}

// ---------- The lessons ----------
// Each lesson makes a question like this:
// { prompt, speak, picture, pictureClass, choices: [{ label, value }], choiceClass, answer, explain }
// A game (like Sorting) has start() instead, and group: "game".

const LESSONS = {
  counting: {
    title: "Counting",
    icon: "🔢",
    makeQuestion() {
      const n = randomInt(1, 10);
      const thing = pick(COUNT_THINGS);
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const options = shuffle([n, ...pickOthers(numbers, 2, n)]);
      return {
        prompt: `How many ${thing.name}?`,
        speak: `How many ${thing.name} can you count?`,
        picture: Array(n).fill(`<span>${thing.emoji}</span>`).join(" "),
        pictureClass: "count",
        choices: options.map(v => ({ label: v, value: v })),
        answer: n,
        explain: `There are ${n} ${thing.name}!`,
      };
    },
  },

  letters: {
    title: "Letters",
    icon: "🔤",
    makeQuestion() {
      const item = pick(LETTER_WORDS);
      const allLetters = LETTER_WORDS.map(w => w.letter);
      const options = shuffle([item.letter, ...pickOthers(allLetters, 2, item.letter)]);
      return {
        prompt: `What letter does it start with?`,
        speak: `What letter does ${item.word} start with?`,
        picture: item.emoji,
        choices: options.map(v => ({ label: v, value: v })),
        answer: item.letter,
        explain: `${item.letter} is for ${item.word}!`,
      };
    },
  },

  colors: {
    title: "Colors",
    icon: "🎨",
    makeQuestion() {
      const target = pick(COLORS);
      const options = shuffle([target, ...pickOthers(COLORS, 3, target)]);
      return {
        prompt: `Find ${target.name.toUpperCase()}!`,
        speak: `Can you find the color ${target.name}?`,
        picture: "🎨",
        choices: options.map(c => ({ label: `<span class="blob" style="background:${c.css}"></span>`, value: c.name })),
        answer: target.name,
        explain: `That's ${target.name}!`,
      };
    },
  },

  shapes: {
    title: "Shapes",
    icon: "🔺",
    makeQuestion() {
      const target = pick(SHAPES);
      const options = shuffle([target, ...pickOthers(SHAPES, 3, target)]);
      return {
        prompt: `Find the ${target.name}!`,
        speak: `Can you find the ${target.name}?`,
        picture: "👀",
        choices: options.map(s => ({ label: s.emoji, value: s.name })),
        answer: target.name,
        explain: `That's a ${target.name}!`,
      };
    },
  },

  turkish: {
    title: "Turkish",
    icon: "🇹🇷",
    makeQuestion() {
      const target = pick(TURKISH_WORDS);
      const options = shuffle([target, ...pickOthers(TURKISH_WORDS, 2, target)]);
      return {
        prompt: `Which one is "${target.turkish}"?`,
        // English and Turkish parts are spoken in different voices
        speak: [
          { text: "Which one is", lang: "en-US" },
          { text: target.turkish, lang: "tr-TR" },
        ],
        picture: "🇹🇷",
        choices: options.map(w => ({ label: w.emoji, value: w.turkish })),
        answer: target.turkish,
        explain: `"${target.turkish}" means ${target.english}!`,
        explainSpeak: [
          { text: target.turkish, lang: "tr-TR" },
          { text: `means ${target.english}!`, lang: "en-US" },
        ],
      };
    },
  },

  // The teacher's own questions come from lessons.js
  mine: {
    title: MY_LESSON_NAME,
    icon: "✏️",
    makeQuestions() {
      return shuffle(MY_QUESTIONS).slice(0, QUESTIONS_PER_LESSON).map(q => ({
        prompt: q.question,
        speak: q.question,
        picture: q.picture,
        choices: shuffle(q.choices).map(c => ({ label: c, value: c })),
        answer: q.answer,
        explain: "",
      }));
    },
  },
};

// Make a lesson's questions, trying not to repeat the same one twice
function makeLessonQuestions(lesson) {
  if (lesson.makeQuestions) return lesson.makeQuestions();

  const questions = [];
  const seen = new Set();
  let attempts = 0;
  while (questions.length < QUESTIONS_PER_LESSON && attempts < 50) {
    const q = lesson.makeQuestion();
    const key = q.prompt + q.answer;
    if (!seen.has(key)) {
      seen.add(key);
      questions.push(q);
    }
    attempts++;
  }
  return questions;
}

// ---------- Talking and sounds ----------

const readAloudBox = document.getElementById("read-aloud");

// Turn "Hello" into [{ text: "Hello", lang: "en-US" }]
function toParts(parts) {
  if (!parts) return [];
  if (typeof parts === "string") return [{ text: parts, lang: "en-US" }];
  return parts;
}

// say("Hello") speaks English.
// say([{ text: "Which one is", lang: "en-US" }, { text: "kedi", lang: "tr-TR" }])
// speaks each part in its own language, one after the other.
function say(parts) {
  if (!readAloudBox.checked || !("speechSynthesis" in window)) return;
  parts = toParts(parts);
  speechSynthesis.cancel();
  const voices = speechSynthesis.getVoices();
  parts.forEach(part => {
    const utterance = new SpeechSynthesisUtterance(part.text);
    utterance.lang = part.lang;
    const voice = voices.find(v => v.lang.replace("_", "-").startsWith(part.lang.slice(0, 2)));
    if (voice) utterance.voice = voice;
    utterance.rate = part.lang.startsWith("tr") ? 0.8 : 0.9; // Turkish a bit slower
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  });
}
// Some browsers load their voices a moment after the page opens
if ("speechSynthesis" in window) speechSynthesis.getVoices();

function stopTalking() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

let audio;
function playNotes(notes) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    notes.forEach((freq, i) => {
      const start = audio.currentTime + i * 0.12;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
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
const happySound = () => playNotes([523, 659, 784]);   // do-mi-sol
const oopsSound = () => playNotes([300, 220]);
const tadaSound = () => playNotes([523, 659, 784, 1047]);

// ---------- Screens ----------

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => (s.hidden = s.id !== id));
  window.scrollTo(0, 0);
}

// Games can add a "clean up" job here (like stopping a timer) for when we leave
const leaveJobs = [];

function goToDesk() {
  leaveJobs.forEach(job => job());
  stopTalking();
  showScreen("desk");
}

// ---------- The game ----------

let currentLessonKey = null;
let questions = [];
let index = 0;
let stars = 0;
let firstTry = true;

const totalStarsText = document.getElementById("total-stars");
let totalStars = Number(localStorage.getItem("classroom-stars") || 0);
totalStarsText.textContent = totalStars;

function addToTotal(amount) {
  totalStars += amount;
  localStorage.setItem("classroom-stars", totalStars);
  totalStarsText.textContent = totalStars;
}

// ⭐ Someone earned a star! (it also goes to the student and the jar)
function earnStar() {
  stars++;
  updateStarBar();
  giveStudentStar();   // students.js
  addMarble();         // jar.js
}

function startLesson(key) {
  leaveJobs.forEach(job => job());
  currentLessonKey = key;
  stars = 0;
  startStudentLesson();   // students.js
  updateStarBar();
  const lesson = LESSONS[key];
  if (lesson.start) return lesson.start();   // games start themselves

  questions = makeLessonQuestions(lesson);
  index = 0;
  showScreen("lesson");
  showQuestion();
}

// Every star bar on every screen shows the stars
function updateStarBar() {
  document.querySelectorAll(".star-bar").forEach(bar => (bar.textContent = "⭐".repeat(stars)));
}

function showQuestion() {
  const q = questions[index];
  firstTry = true;

  document.getElementById("progress").textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById("prompt").textContent = q.prompt;
  const picture = document.getElementById("picture");
  picture.innerHTML = q.picture;
  picture.className = "picture " + (q.pictureClass || "");
  document.getElementById("feedback").textContent = "";

  const choicesBox = document.getElementById("choices");
  choicesBox.innerHTML = "";
  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice " + (q.choiceClass || "");
    btn.innerHTML = choice.label;
    btn.onclick = () => answer(btn, choice.value);
    choicesBox.appendChild(btn);
  });

  // 🧒 Whose turn is it?
  const student = nextTurn();
  showTurn(document.getElementById("turn"), student);
  const turnWords = student ? [{ text: `${student.name}, your turn!`, lang: "en-US" }] : [];
  say([...turnWords, ...toParts(q.speak)]);
}

function answer(btn, value) {
  const q = questions[index];
  const feedback = document.getElementById("feedback");

  if (String(value) === String(q.answer)) {
    btn.classList.add("correct");
    document.querySelectorAll(".choice").forEach(b => (b.disabled = true));
    if (firstTry) earnStar();
    const praise = pick(PRAISE);
    feedback.textContent = `🎉 ${praise} ${q.explain}`;
    happySound();
    // The teacher's own "Good job!" plays if she recorded one
    if (!playVoice("goodJob")) {
      if (q.explainSpeak) say([{ text: praise, lang: "en-US" }, ...q.explainSpeak]);
      else say(`${praise} ${q.explain}`);
    }
    setTimeout(nextQuestion, 2400);
  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    firstTry = false;
    feedback.textContent = "Oops! Try again 💪";
    oopsSound();
    if (!playVoice("tryAgain")) say("Oops! Try again!");
  }
}

function nextQuestion() {
  if (document.getElementById("lesson").hidden) return;   // the teacher left the lesson
  index++;
  if (index < questions.length) {
    showQuestion();
  } else {
    finishLesson();
  }
}

// 🎉 The end of a lesson or a game
function finishLesson() {
  addToTotal(stars);
  showScreen("finish");
  const sticker = document.getElementById("sticker");
  sticker.textContent = pick(STICKERS);
  sticker.style.animation = "none";
  sticker.offsetHeight; // restart the pop animation
  sticker.style.animation = "";
  document.getElementById("finish-text").textContent =
    `You got ${stars} star${stars === 1 ? "" : "s"} in ${LESSONS[currentLessonKey].title}!`;
  document.getElementById("finish-stars").textContent = "⭐".repeat(stars) || "💪 Keep practicing!";
  document.getElementById("finish-students").innerHTML = studentStarsText();   // students.js
  tadaSound();
  if (!playVoice("finish")) say(`Great job, class! You got ${stars} stars! Here is your sticker!`);

  // 🫙 Is the reward jar full? Party time!
  if (jarIsFull()) setTimeout(showParty, 2500);
}

// ---------- Buttons ----------

document.getElementById("speak-again").onclick = () => say(questions[index].speak);

document.getElementById("teacher-star").onclick = () => {
  earnStar();
  const bar = document.getElementById("star-bar");
  bar.classList.remove("star-pop");
  bar.offsetHeight;
  bar.classList.add("star-pop");
  happySound();
  say("The teacher gave you a star!");
};

// Every "← Desk" button goes back to the desk
document.querySelectorAll(".to-desk").forEach(btn => (btn.onclick = goToDesk));
document.getElementById("again").onclick = () => startLesson(currentLessonKey);
document.getElementById("finish-recess").onclick = () => startLesson("recess");
