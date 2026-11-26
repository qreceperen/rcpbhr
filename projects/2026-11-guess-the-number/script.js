// 🎲 The computer picks a secret number from 1 to 100
let secret = Math.floor(Math.random() * 100) + 1;
let tries = 0;

const guessInput = document.getElementById("guess");
const guessButton = document.getElementById("guess-button");
const hint = document.getElementById("hint");
const triesText = document.getElementById("tries");
const restart = document.getElementById("restart");

function checkGuess() {
  const guess = Number(guessInput.value);

  if (!guess || guess < 1 || guess > 100) {
    hint.textContent = "Pick a number from 1 to 100 🙂";
    return;
  }

  tries = tries + 1;
  triesText.textContent = "Tries: " + tries;

  if (guess < secret) {
    hint.textContent = "⬆️ Higher!";
  } else if (guess > secret) {
    hint.textContent = "⬇️ Lower!";
  } else {
    hint.textContent = "🎉 You got it! It was " + secret + "!";
    hint.classList.add("win");
    guessButton.disabled = true;
    restart.hidden = false;
  }

  guessInput.value = "";
  guessInput.focus();
}

guessButton.addEventListener("click", checkGuess);

// Pressing Enter also makes a guess
guessInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") checkGuess();
});

restart.addEventListener("click", function () {
  secret = Math.floor(Math.random() * 100) + 1;
  tries = 0;
  triesText.textContent = "Tries: 0";
  hint.textContent = "🤔";
  hint.classList.remove("win");
  guessButton.disabled = false;
  restart.hidden = true;
  guessInput.focus();
});
