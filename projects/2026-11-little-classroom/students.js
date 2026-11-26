// 🧒 STUDENTS
// The teacher types the students' names. In lessons, everyone takes turns,
// and each student earns their own stars.
// The names are saved only in this browser (they are never in the code or online).

let students = JSON.parse(localStorage.getItem("classroom-students") || "[]");   // [{ name, stars }]
let turn = 0;                // whose turn is next
let currentStudent = null;   // whose turn it is now
let lessonStars = {};        // stars each student got in THIS lesson

function saveStudents() {
  localStorage.setItem("classroom-students", JSON.stringify(students));
}

// ---------- Turns ----------

// Move to the next student (or nobody, if there are no students)
function nextTurn() {
  if (!students.length) {
    currentStudent = null;
    return null;
  }
  currentStudent = students[turn % students.length];
  turn++;
  return currentStudent;
}

// Show "🧒 Ali's turn!" in a box (or hide the box)
function showTurn(box, student) {
  box.hidden = !student;
  if (!student) return;
  box.textContent = `🧒 ${student.name}'s turn!`;
  box.classList.remove("star-pop");
  box.offsetHeight;
  box.classList.add("star-pop");
}

// A new lesson starts: nobody has a turn yet
function startStudentLesson() {
  currentStudent = null;
  lessonStars = {};
}

function giveStudentStar() {
  if (!currentStudent) return;
  currentStudent.stars++;
  lessonStars[currentStudent.name] = (lessonStars[currentStudent.name] || 0) + 1;
  saveStudents();
  drawStudents();
}

// For the finish screen: "Ali ⭐⭐  Ayşe ⭐"
function studentStarsText() {
  return Object.entries(lessonStars)
    .map(([name, count]) => `<span class="student-chip">${escapeHTML(name)} ${"⭐".repeat(count)}</span>`)
    .join(" ");
}

// Names are typed by people, so we make them safe to show on the page
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- 📋 The students page ----------

function drawStudents() {
  const list = document.getElementById("student-list");
  list.innerHTML = "";
  if (!students.length) {
    list.innerHTML = `<li class="empty-list">No students yet. Type a name and press Add! ✏️</li>`;
  }
  students.forEach((student, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="student-name">🧒 ${escapeHTML(student.name)}</span>
      <span class="student-stars">${student.stars} ⭐</span>
      <button class="small remove" title="Remove">❌</button>`;
    li.querySelector(".remove").onclick = () => {
      students.splice(i, 1);
      saveStudents();
      drawStudents();
    };
    list.appendChild(li);
  });
  document.getElementById("student-count").textContent = students.length;
}

document.getElementById("student-form").onsubmit = event => {
  event.preventDefault();   // don't reload the page
  const input = document.getElementById("student-name");
  const name = input.value.trim();
  if (!name) return;
  students.push({ name, stars: 0 });
  saveStudents();
  drawStudents();
  input.value = "";
  input.focus();
  happySound();
};

document.getElementById("reset-student-stars").onclick = () => {
  students.forEach(s => (s.stars = 0));
  saveStudents();
  drawStudents();
};

document.getElementById("open-students").onclick = () => {
  drawStudents();
  showScreen("students");
};
