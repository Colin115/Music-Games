const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const noteNameSpan = document.getElementById("note-name");
document.getElementById("start-btn").addEventListener("click", startGame);

// canvas.width = Math.min(window.innerWidth * 0.9, 600);
// canvas.height = 400;

const timerSpan = document.getElementById("timer");
const scoreSpan = document.getElementById("score");

let score = 0;
let noteCount = 3;

/* -------------------------------
   Timer state
-------------------------------- */
let timeLimit = 30; // seconds
let timeLeft = timeLimit;
let startTime = null;
let timerRunning = false;


/* -------------------------------
   Note definitions
-------------------------------- */
const NOTES = getAllNotes();

let targetNote;
let placedNotes = [];
let round = 0;
const BASE_NOTE_SIZE = 50;
const MIN_NOTE_SIZE = 22;

/* -------------------------------
   Game setup
-------------------------------- */
function startRound() {
  placedNotes = [];

  targetNote = NOTES[Math.floor(Math.random() * NOTES.length)];
  noteNameSpan.textContent = targetNote.name;
  statusText.textContent = "Find the note before the time is up!";

  const randNotes = NOTES.filter(note => note !== targetNote);
  const noteSize = getNoteSize();

  for (let i = 0; i < noteCount - 1; i++) {
    const note = randNotes[Math.floor(Math.random() * randNotes.length)];
    placedNotes.push({
      ...note,
      x: Math.random() * (canvas.width - noteSize) + noteSize / 2,
      y: Math.random() * (canvas.height - noteSize) + noteSize / 2,
    });
  }

  placedNotes.push({
    ...targetNote,
    x: Math.random() * (canvas.width - noteSize) + noteSize / 2,
    y: Math.random() * (canvas.height - noteSize) + noteSize / 2,
  });

  draw();
}


/* -------------------------------
   Drawing
-------------------------------- */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const noteSize = getNoteSize();

  ctx.font = `${noteSize}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const note of placedNotes) {
   drawNote(note);
  }
}

function drawNote(note) {
  const img = getNoteImage(note);
  const size = getNoteSize();

  // Preserve aspect ratio
  const aspect = img.width / img.height;

  let drawWidth, drawHeight;

  if (aspect >= 1) {
    // wide image (whole note)
    drawWidth = size;
    drawHeight = size / aspect;
  } else {
    // tall image (quarter / half)
    drawHeight = size;
    drawWidth = size * aspect;
  }

  ctx.drawImage(
    img,
    note.x - drawWidth / 2,
    note.y - drawHeight / 2,
    drawWidth,
    drawHeight
  );
}



function getNoteSize() {
  const size = BASE_NOTE_SIZE - noteCount * 1.2;
  return Math.max(MIN_NOTE_SIZE, size);
}


/* -------------------------------
   Click handling
-------------------------------- */
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const noteSize = getNoteSize();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;
  console.log(mx, my);
  for (const note of placedNotes) {
    const dx = mx - note.x;
    const dy = my - note.y;
    console.log(note);
    if (Math.abs(dx) < noteSize / 2 && Math.abs(dy) < noteSize / 2 && targetNote.name === note.name) {
      handleGuess(note);
      return;
    }
  }
  handleGuess(false)
});

function handleGuess(correct) {
  if (!timerRunning) return;

  if (correct) {
    score++;
    noteCount += 5;
    timeLimit += 3;

    scoreSpan.textContent = score;
    statusText.textContent = "Correct! 🎉";

    setTimeout(startRound, 400);
  } else {
    statusText.textContent = "Try again!";
  }
}

function endGame() {
  timerRunning = false;
  statusText.textContent = `Time's up! Final score: ${score}`;
}



/* -------------------------------
Game Timer
-------------------------------- */
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


/* -------------------------------
   Start game
-------------------------------- */
function startGame() {
  score = 0;
  noteCount = 3;
  timeLimit = 30;
  timeLeft = timeLimit;

  scoreSpan.textContent = score;
  timerSpan.textContent = `Time: ${timeLeft.toFixed(1)}s`;

  startTime = performance.now();
  timerRunning = true;

  startRound();
  requestAnimationFrame(timerLoop);
}
