// 📚 MORE LESSONS
// Animals, Opposites, Bigger or Smaller, Patterns, Easy Math, Feelings and Telling Time.
// Each one works like the first lessons: a question, a picture and answers to tap.

// ---------- 🐮 Animals ----------

const ANIMAL_SOUNDS = [
  { emoji: "🐮", name: "cow", sound: "MOO" },
  { emoji: "🐶", name: "dog", sound: "WOOF" },
  { emoji: "🐱", name: "cat", sound: "MEOW" },
  { emoji: "🦆", name: "duck", sound: "QUACK" },
  { emoji: "🐷", name: "pig", sound: "OINK" },
  { emoji: "🐑", name: "sheep", sound: "BAA" },
  { emoji: "🦁", name: "lion", sound: "ROAR" },
  { emoji: "🐸", name: "frog", sound: "RIBBIT" },
  { emoji: "🐴", name: "horse", sound: "NEIGH" },
  { emoji: "🐓", name: "rooster", sound: "COCK-A-DOODLE-DOO" },
  { emoji: "🐝", name: "bee", sound: "BUZZ" },
  { emoji: "🦉", name: "owl", sound: "HOO HOO" },
  { emoji: "🐍", name: "snake", sound: "HISS" },
  { emoji: "🐭", name: "mouse", sound: "SQUEAK" },
];

// Animal riddles: the answer, and wrong answers that DON'T fit
const ANIMAL_RIDDLES = [
  { question: "Which one has stripes?", answer: "🦓", name: "zebra", wrong: ["🐘", "🐷", "🐸", "🐔"] },
  { question: "Which one can fly?", answer: "🦅", name: "eagle", wrong: ["🐶", "🐢", "🐴", "🐷"] },
  { question: "Which one lives in the sea?", answer: "🐳", name: "whale", wrong: ["🐮", "🐱", "🐒", "🐰"] },
  { question: "Which one has a long neck?", answer: "🦒", name: "giraffe", wrong: ["🐷", "🐶", "🐸", "🐭"] },
  { question: "Which one has a trunk?", answer: "🐘", name: "elephant", wrong: ["🦁", "🐱", "🐔", "🐰"] },
  { question: "Which one is very slow?", answer: "🐢", name: "turtle", wrong: ["🐆", "🐇", "🐎"] },
  { question: "Which one gives us milk?", answer: "🐮", name: "cow", wrong: ["🐔", "🐟", "🐸", "🦁"] },
  { question: "Which one lays eggs?", answer: "🐔", name: "chicken", wrong: ["🐮", "🐶", "🐱", "🐴"] },
  { question: "Which one loves bananas?", answer: "🐒", name: "monkey", wrong: ["🐟", "🐍", "🐔", "🐑"] },
];

LESSONS.animals = {
  title: "Animals",
  icon: "🐮",
  makeQuestion() {
    // Half the time: animal sounds. The other half: animal riddles.
    if (Math.random() < 0.5) {
      const target = pick(ANIMAL_SOUNDS);
      const options = shuffle([target, ...pickOthers(ANIMAL_SOUNDS, 2, target)]);
      return {
        prompt: `Who says ${target.sound}?`,
        speak: `Who says ${target.sound.toLowerCase()}?`,
        picture: "🔊",
        choices: options.map(a => ({ label: a.emoji, value: a.name })),
        answer: target.name,
        explain: `The ${target.name} says ${target.sound}!`,
      };
    }
    const riddle = pick(ANIMAL_RIDDLES);
    const options = shuffle([riddle.answer, ...shuffle(riddle.wrong).slice(0, 2)]);
    return {
      prompt: riddle.question,
      speak: riddle.question,
      picture: "🤔",
      choices: options.map(e => ({ label: e, value: e })),
      answer: riddle.answer,
      explain: `It's the ${riddle.name}!`,
    };
  },
};

// ---------- ↕️ Opposites ----------

const OPPOSITES = [
  [{ word: "big", emoji: "🐘" }, { word: "small", emoji: "🐭" }],
  [{ word: "hot", emoji: "🔥" }, { word: "cold", emoji: "🧊" }],
  [{ word: "happy", emoji: "😊" }, { word: "sad", emoji: "😢" }],
  [{ word: "up", emoji: "⬆️" }, { word: "down", emoji: "⬇️" }],
  [{ word: "day", emoji: "☀️" }, { word: "night", emoji: "🌙" }],
  [{ word: "fast", emoji: "🐇" }, { word: "slow", emoji: "🐢" }],
  [{ word: "open", emoji: "📖" }, { word: "closed", emoji: "📕" }],
  [{ word: "loud", emoji: "📢" }, { word: "quiet", emoji: "🤫" }],
  [{ word: "awake", emoji: "😃" }, { word: "asleep", emoji: "😴" }],
  [{ word: "stop", emoji: "🛑" }, { word: "go", emoji: "🟢" }],
  [{ word: "wet", emoji: "💦" }, { word: "dry", emoji: "🏜️" }],
];

// A picture with its word under it
const withWord = thing => `<span class="emoji">${thing.emoji}</span><span class="word">${thing.word}</span>`;

LESSONS.opposites = {
  title: "Opposites",
  icon: "↕️",
  makeQuestion() {
    const pair = shuffle(pick(OPPOSITES));   // which side we ask about is random
    const [asked, answer] = pair;
    const others = pickOthers(OPPOSITES, 2, OPPOSITES.find(p => p.includes(asked))).map(p => pick(p));
    const options = shuffle([answer, ...others]);
    return {
      prompt: `What is the opposite of ${asked.word.toUpperCase()}?`,
      speak: `What is the opposite of ${asked.word}?`,
      picture: withWord(asked),
      pictureClass: "with-word",
      choices: options.map(o => ({ label: withWord(o), value: o.word })),
      choiceClass: "words",
      answer: answer.word,
      explain: `The opposite of ${asked.word} is ${answer.word}!`,
    };
  },
};

// ---------- 🐘🐭 Bigger or Smaller ----------

// A number with little dots under it, so you can count them
const numberWithDots = n => `<span class="emoji">${n}</span><span class="dots">${"<i></i>".repeat(n)}</span>`;

LESSONS.bigger = {
  title: "Bigger or Smaller",
  icon: "🐘",
  makeQuestion() {
    const a = randomInt(1, 10);
    const b = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(n => n !== a));
    const askBigger = Math.random() < 0.5;
    const answer = askBigger ? Math.max(a, b) : Math.min(a, b);
    const other = answer === a ? b : a;
    const word = askBigger ? "bigger" : "smaller";
    return {
      prompt: `Which number is ${word.toUpperCase()}?`,
      speak: `Which number is ${word}, ${a} or ${b}?`,
      picture: askBigger ? "🐘" : "🐭",
      choices: [a, b].map(n => ({ label: numberWithDots(n), value: n })),
      choiceClass: "words",
      answer,
      explain: `${answer} is ${word} than ${other}!`,
    };
  },
};

// ---------- 🔴🔵 What comes next? (patterns) ----------

const PATTERN_THINGS = [
  ["🔴", "🔵", "🟡", "🟢"],
  ["🍎", "🍌", "🍇", "🍊"],
  ["🐶", "🐱", "🐰", "🐸"],
  ["⭐", "❤️", "🌙", "☀️"],
];
// The pattern shapes: A and B (and C) stand for things
const PATTERN_SHAPES = ["AB", "ABC", "AAB", "ABB"];

LESSONS.patterns = {
  title: "What Comes Next?",
  icon: "🔁",
  makeQuestion() {
    const things = shuffle(pick(PATTERN_THINGS));
    const shape = pick(PATTERN_SHAPES);
    const unit = shape.split("").map(letter => things["ABC".indexOf(letter)]);
    // Repeat the pattern 2 times, plus a bit more
    const length = unit.length * 2 + randomInt(1, unit.length);
    const row = Array.from({ length }, (_, i) => unit[i % unit.length]);
    const answer = row.pop();   // the last one is the secret
    const options = shuffle([answer, ...pickOthers(things, 2, answer)]);
    return {
      prompt: "What comes next?",
      speak: "What comes next in the pattern?",
      picture: row.join(" ") + ` <span class="mystery">❓</span>`,
      pictureClass: "pattern",
      choices: options.map(e => ({ label: e, value: e })),
      answer,
      explain: "You found the pattern!",
    };
  },
};

// ---------- ➕ Easy Math ----------

LESSONS.math = {
  title: "Easy Math",
  icon: "➕",
  makeQuestion() {
    const a = randomInt(1, 5);
    const b = randomInt(1, 5);
    const sum = a + b;
    const thing = pick(COUNT_THINGS);
    const near = [sum - 2, sum - 1, sum + 1, sum + 2].filter(n => n >= 1 && n <= 10);
    const options = shuffle([sum, ...shuffle(near).slice(0, 2)]);
    return {
      prompt: `What is ${a} + ${b}?`,
      speak: `What is ${a} plus ${b}?`,
      picture: `${thing.emoji.repeat(a)} <b class="plus">+</b> ${thing.emoji.repeat(b)}`,
      pictureClass: "count",
      choices: options.map(n => ({ label: n, value: n })),
      answer: sum,
      explain: `${a} plus ${b} is ${sum}!`,
    };
  },
};

// ---------- 😊 Feelings ----------

const FEELINGS = [
  { name: "happy", emoji: "😊" },
  { name: "sad", emoji: "😢" },
  { name: "angry", emoji: "😠" },
  { name: "scared", emoji: "😨" },
  { name: "surprised", emoji: "😮" },
  { name: "sleepy", emoji: "😴" },
  { name: "silly", emoji: "🤪" },
  { name: "loved", emoji: "🥰" },
];

LESSONS.feelings = {
  title: "Feelings",
  icon: "😊",
  makeQuestion() {
    const target = pick(FEELINGS);
    const options = shuffle([target, ...pickOthers(FEELINGS, 2, target)]);
    return {
      prompt: `Which face is ${target.name.toUpperCase()}?`,
      speak: `Which face is ${target.name}?`,
      picture: "💭",
      choices: options.map(f => ({ label: f.emoji, value: f.name })),
      answer: target.name,
      explain: `That face is ${target.name}!`,
    };
  },
};

// ---------- 🕒 Telling Time (o'clock only) ----------

// Draws a big friendly clock. The short hand points to the hour,
// the long hand points straight up to 12.
function clockPicture(hour) {
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const angle = (n * 30 * Math.PI) / 180;
    const x = 50 + 36 * Math.sin(angle);
    const y = 50 - 36 * Math.cos(angle) + 3.5;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="10" font-weight="bold" fill="#2d2a32">${n}</text>`;
  }).join("");
  return `
    <svg class="clock" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="white" stroke="#ff6b9d" stroke-width="5"/>
      ${numbers}
      <line x1="50" y1="50" x2="50" y2="15" stroke="#3a86ff" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="50" y2="29" stroke="#ff3b3b" stroke-width="6" stroke-linecap="round" transform="rotate(${hour * 30} 50 50)"/>
      <circle cx="50" cy="50" r="4" fill="#2d2a32"/>
    </svg>`;
}

LESSONS.time = {
  title: "Telling Time",
  icon: "🕒",
  makeQuestion() {
    const hour = randomInt(1, 12);
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const options = shuffle([hour, ...pickOthers(hours, 2, hour)]);
    return {
      prompt: "What time is it?",
      speak: "What time is it?",
      picture: clockPicture(hour),
      choices: options.map(h => ({ label: `${h} o'clock`, value: h })),
      choiceClass: "words time",
      answer: hour,
      explain: `The short hand points to ${hour}. It's ${hour} o'clock!`,
    };
  },
};
