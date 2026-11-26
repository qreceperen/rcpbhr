// 🎤 THE TEACHER'S OWN VOICE
// Record yourself saying "Good job!" and the game plays YOUR voice
// instead of the computer voice.
// Recordings are saved only in this browser. They never go online.

const VOICE_SLOTS = [
  { key: "goodJob",  label: "Good job! 🎉",          when: "Plays when someone gets it right." },
  { key: "tryAgain", label: "Try again! 💪",         when: "Plays when someone picks a wrong answer." },
  { key: "finish",   label: "Great job, class! 🏆",  when: "Plays at the end of a lesson." },
];
const LONGEST_RECORDING = 5;   // seconds

const voiceStorageName = key => "classroom-voice-" + key;

function hasVoice(key) {
  return !!localStorage.getItem(voiceStorageName(key));
}

// Play a recording. Returns true if there was one to play.
function playVoice(key) {
  const recording = localStorage.getItem(voiceStorageName(key));
  if (!recording) return false;
  stopTalking();
  new Audio(recording).play().catch(() => {});
  return true;
}

// ---------- 🔴 Recording ----------

let recorder = null;   // the recorder that is recording right now
let stopTimer = null;

async function startRecording(key) {
  const status = document.getElementById("voice-status");
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    status.textContent = "😕 This browser can't record. Try Chrome!";
    return;
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    status.textContent = "🎤 Please let the page use the microphone, then try again.";
    return;
  }

  const pieces = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = event => pieces.push(event.data);
  recorder.onstop = () => {
    stream.getTracks().forEach(track => track.stop());   // turn the microphone off
    const blob = new Blob(pieces, { type: recorder.mimeType });
    recorder = null;
    // Save the sound as text, so it can live in the browser's storage
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem(voiceStorageName(key), reader.result);
        status.textContent = "✅ Saved! Press ▶️ to listen.";
      } catch (e) {
        status.textContent = "😕 That recording was too big. Try a shorter one!";
      }
      drawVoiceSlots();
    };
    reader.readAsDataURL(blob);
  };
  recorder.start();
  recorder.recordingKey = key;
  status.textContent = `🔴 Recording... say it now! (press ⏹️ when you're done)`;
  drawVoiceSlots();
  stopTimer = setTimeout(stopRecording, LONGEST_RECORDING * 1000);   // stop by itself after 5 seconds
}

function stopRecording() {
  clearTimeout(stopTimer);
  if (recorder && recorder.state === "recording") recorder.stop();
}

// ---------- 📋 The voice page ----------

function drawVoiceSlots() {
  const box = document.getElementById("voice-slots");
  box.innerHTML = "";
  VOICE_SLOTS.forEach(slot => {
    const recordingThis = recorder && recorder.recordingKey === slot.key;
    const row = document.createElement("div");
    row.className = "voice-slot";
    row.innerHTML = `
      <div>
        <div class="voice-label">${slot.label}</div>
        <div class="voice-when">${slot.when}</div>
      </div>
      <div class="voice-buttons">
        <button class="record ${recordingThis ? "recording" : ""}">${recordingThis ? "⏹️ Stop" : "🔴 Record"}</button>
        <button class="play" ${hasVoice(slot.key) ? "" : "disabled"}>▶️</button>
        <button class="delete small" ${hasVoice(slot.key) ? "" : "disabled"} title="Delete">🗑️</button>
      </div>`;
    row.querySelector(".record").onclick = () => (recordingThis ? stopRecording() : !recorder && startRecording(slot.key));
    row.querySelector(".play").onclick = () => playVoice(slot.key);
    row.querySelector(".delete").onclick = () => {
      localStorage.removeItem(voiceStorageName(slot.key));
      document.getElementById("voice-status").textContent = "🗑️ Deleted. The computer voice will talk instead.";
      drawVoiceSlots();
    };
    box.appendChild(row);
  });
}

document.getElementById("open-voice").onclick = () => {
  document.getElementById("voice-status").textContent = "";
  drawVoiceSlots();
  showScreen("voice");
};
leaveJobs.push(stopRecording);
