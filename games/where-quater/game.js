/* ===============================
   Canvas + DOM
================================ */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const statusText = document.getElementById("status");
const noteNameSpan = document.getElementById("note-name");
const timerSpan = document.getElementById("timer");
const scoreSpan = document.getElementById("score");
const startBtn = document.getElementById("start-btn");

canvas.width = Math.min(window.innerWidth * 0.9, 600);
canvas.height = 400;

/* ===============================
   Notes
================================ */
const NOTES = [
  { name: "whole", symbol: "𝅝" },
  { name: "half", symbol: "𝅗𝅥" },
  { name: "quarter", symbol: "𝅘𝅥" },
  { name: "eighth", symbol: "𝅘𝅥𝅮" },
];

/* ===============================
   Difficulty scaling
================================ */
const BASE_NOTE_SIZE = 50;
const MIN_NOTE_SIZE = 22;
const NOTE_GROWTH = 5;
const TIME_BONUS = 3;

/* ===============================
   Game state
================================ */
let placedNotes = [];
let targetNote = null;

let score = 0;
let noteCount = 3;

/* ===============================
   Timer state
================================ */
let timeLimit = 30;
let timeLeft = 30;
let startTime = null;
let timerRunning = false;

/* ===============================
   Helpers
================================ */
function getNoteSize() {
  return Math.max(
    MIN_NOTE_SIZE,
    BASE_NOTE_SIZE - Math.log2(noteCount + 1) * 8
  );
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* ===============================
   Non-overlapping placement
================================ */
function placeNote(existing, size) {
  for (let attempts = 0; attempts < 100; attempts++) {
    const note = {
      x: Math.random() * (canvas.width - size) + size / 2,
      y: Math.random() * (canvas.height - size) + size / 2,
    };

    if (existing.every(n => distance(n, note) > size)) {
      return note;
    }
  }
  return null;
}

/* ===============================
   Round setup
================================ */
function startRound() {
  placedNotes = [];
  const noteSize = getNoteSize();

  targetNote = NOTES[Math.floor(Math.random() * NOTES.length)];
  noteNameSpan.textContent = targetNote.name;
  statusText.textContent = "Find the note!";

  const distractors = NOTES.filter(n => n !== targetNote);

  for (let i = 0; i < noteCount - 1; i++) {
    const base = distractors[Math.floor(Math.random() * distractors.length)];
    const pos = placeNote(placedNotes, noteSize);
    if (pos) placedNotes.push({ ...base, ...pos });
  }

  const targetPos = placeNote(placedNotes, noteSize);
  if (targetPos) placedNotes.push({ ...targetNote, ...targetPos });

  draw();
}

/* ===============================
   Drawing
================================ */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const noteSize = getNoteSize();
  ctx.font = `${noteSize}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const note of placedNotes) {
    ctx.fillText(note.symbol, note.x, note.y);
  }
}

/* ===============================
   Click / Touch handling
================================ */
function handlePointer(e) {
  if (!timerRunning) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  const noteSize = getNoteSize();

  for (const note of placedNotes) {
    if (
      Math.abs(mx - note.x) < noteSize / 2 &&
      Math.abs(my - note.y) < noteSize / 2
    ) {
      handleGuess(note);
      return;
    }
  }
}

canvas.addEventListener("click", handlePointer);
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  handlePointer(e.touches[0]);
});

/* ===============================
   Guess logic
================================ */
function handleGuess(note) {
  if (note.name === targetNote.name) {
    score++;
    noteCount += NOTE_GROWTH;
    timeLimit += TIME_BONUS;

    scoreSpan.textContent = score;
    statusText.textContent = "Correct! 🎉";

    setTimeout(startRound, 300);
  } else {
    statusText.textContent = "Try again!";
  }
}

/* ===============================
   Timer loop
================================ */
function timerLoop(now) {
  if (!timerRunning) return;

  const elapsed = (now - startTime) / 1000;
  timeLeft = Math.max(0, timeLimit - elapsed);
  timerSpan.textContent = `Time: ${timeLeft.toFixed(1)}s`;

  if (timeLeft <= 0) {
    endGame();
    return;
  }

  requestAnimationFrame(timerLoop);
}

/* ===============================
   Game start / end
================================ */
function startGame() {
  score = 0;
  noteCount = 3;
  timeLimit = 30;
  timeLeft = 30;

  scoreSpan.textContent = score;
  timerSpan.textContent = `Time: ${timeLeft.toFixed(1)}s`;
  statusText.textContent = "Go!";

  startTime = performance.now();
  timerRunning = true;

  startRound();
  requestAnimationFrame(timerLoop);
}

function endGame() {
  timerRunning = false;
  statusText.textContent = `Time's up! Final score: ${score}`;
}

/* ===============================
