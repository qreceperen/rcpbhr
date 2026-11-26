// The code that makes this project work goes here

const button = document.getElementById("magic-button");
const message = document.getElementById("message");

const words = ["Hello! 👋", "You did it! 🎉", "Again? 😄", "Super! ⭐"];
let count = 0;

button.addEventListener("click", function () {
  message.textContent = words[count % words.length];
  count = count + 1;
});
