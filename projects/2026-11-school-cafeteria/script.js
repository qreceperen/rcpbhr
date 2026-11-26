// 🍕 SCHOOL CAFETERIA GAME

const startScreen = document.getElementById("start-screen");
const directionsScreen = document.getElementById("directions-screen");

// Press Play → show the directions
document.getElementById("play-button").onclick = () => {
  startScreen.hidden = true;
  directionsScreen.hidden = false;
};

// Press X → close the directions and START THE GAME!
document.getElementById("close-button").onclick = () => {
  directionsScreen.hidden = true;
  startGame();
};
