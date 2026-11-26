// 🏫 THE TEACHER'S DESK
// This file runs LAST, after all the lessons and games are ready.
// It puts a card on the desk for every lesson and game.

function buildDesk() {
  const lessonGrid = document.getElementById("lesson-grid");
  const gameGrid = document.getElementById("game-grid");
  lessonGrid.innerHTML = "";
  gameGrid.innerHTML = "";

  // The teacher's own questions go at the end of the lessons
  const keys = Object.keys(LESSONS).filter(key => key !== "mine").concat("mine");
  keys.forEach(key => {
    const lesson = LESSONS[key];
    const card = document.createElement("button");
    card.className = "lesson-card" + (lesson.group === "game" ? " game" : "");
    card.innerHTML = `<span class="icon">${lesson.icon}</span>${lesson.title}`;
    card.onclick = () => startLesson(key);
    (lesson.group === "game" ? gameGrid : lessonGrid).appendChild(card);
  });
}

// 🚀 Ready, set, go!
buildDesk();
drawJars();
drawStudents();
