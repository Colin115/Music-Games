const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const targetSpan = document.getElementById("target-note");
const scoreSpan = document.getElementById("score");
const startBtn = document.getElementById("start-btn");
const statusText = document.getElementById("status");

canvas.width = 600;
canvas.height = 420;

/* -------------------------------
   Notes
-------------------------------- */
const NOTES = getAllNotes();

const NOTE_SIZE = 44; // ⬅ bigger notes
const PLATFORM_WIDTH = 70;
const PLATFORM_HEIGHT = 12;

let falling = [];
let targetNote;
let basketX = canvas.width / 2;
let score = 0;
let speed = 1.6;
let running = false;
let startTime;

let lives = 3;
let spawnAccumulator = 0;
const SPAWN_INTERVAL = 900; // ms between notes (consistent)
let lastFrameTime = 0;

/* -------------------------------
   Start Game
-------------------------------- */
startBtn.onclick = () => {
  score = 0;
  lives = 3;
  speed = 1.6;
  falling = [];
  spawnAccumulator = 0;
  running = true;

  targetNote = NOTES[Math.floor(Math.random() * 3)];
  targetSpan.textContent = targetNote.name;
  console.log(targetNote);
  scoreSpan.textContent = score;
  updateLivesDisplay();

  lastFrameTime = performance.now();
  requestAnimationFrame(loop);
};

/* -------------------------------
   Spawn Notes
-------------------------------- */
function spawnNote() {
  // 60% chance target note, 40% obstacles
  const roll = Math.random();

  let note;
  if (roll < 0.6) {
    note = targetNote;
  } else {
    // pick a wrong note or rest
    const obstacles = NOTES.filter((n) => n.name !== targetNote.name);
    note = obstacles[Math.floor(Math.random() * obstacles.length)];
  }

  falling.push({
    ...note,
    x: Math.random() * (canvas.width - NOTE_SIZE * 2) + NOTE_SIZE,
    y: -NOTE_SIZE,
  });
}

/* -------------------------------
   Main Loop
-------------------------------- */
function loop(now) {
  if (!running) return;

  const delta = now - lastFrameTime;
  lastFrameTime = now;

  spawnAccumulator += delta;
  if (spawnAccumulator >= SPAWN_INTERVAL) {
    spawnNote();
    spawnAccumulator = 0;
  }

  update();
  draw();
  requestAnimationFrame(loop);
}

/* -------------------------------
   Update
-------------------------------- */
function update() {
  for (const note of falling) {
    note.y += speed;
  }

  falling = falling.filter((note) => {
    // Hit platform
    if (
      note.y + NOTE_SIZE / 2 >= canvas.height - 30 &&
      Math.abs(note.x - basketX) < PLATFORM_WIDTH / 2
    ) {
      if (note.name === targetNote.name) {
        score++;
        speed += 0.15;
      } else {
        loseLife();
      }

      scoreSpan.textContent = score;
      return false;
    }

    // Missed correct note
    if (note.y > canvas.height + NOTE_SIZE) {
      if (note.name === targetNote.name) {
        loseLife();
      }
      return false;
    }

    return true;
  });
}

/* -------------------------------
   Loose Lives
-------------------------------- */
function loseLife() {
  lives--;
  updateLivesDisplay();
  shakeCanvas();

  if (lives <= 0) {
    running = false;
    statusText.textContent = `Game Over! Final score: ${score}`;
  }
}

/* -------------------------------
   Draw
-------------------------------- */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Platform
  ctx.fillStyle = "#333";
  ctx.fillRect(
    basketX - PLATFORM_WIDTH / 2,
    canvas.height - 25,
    PLATFORM_WIDTH,
    PLATFORM_HEIGHT
  );

  // Notes
  ctx.font = `${NOTE_SIZE}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const note of falling) {
    drawNote(note);
  }
}

function drawNote(note) {
  const img = getNoteImage(note);
  const size = NOTE_SIZE;
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

/* -------------------------------
   Canvas Shake
-------------------------------- */

function shakeCanvas() {
  canvas.classList.add("shake");
  setTimeout(() => canvas.classList.remove("shake"), 300);
}

/* -------------------------------
   Lives Display
-------------------------------- */

function updateLivesDisplay() {
  statusText.textContent = `Lives: ${"❤️".repeat(lives)}`;
}

/* -------------------------------
   Controls (Keyboard)
-------------------------------- */
document.addEventListener("keydown", (e) => {
  if (!running) return;

  if (e.key === "ArrowLeft") basketX -= 30;
  if (e.key === "ArrowRight") basketX += 30;

  clampBasket();
});

/* -------------------------------
   Controls (Mouse + Touch)
-------------------------------- */
function setBasketFromClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  basketX = (clientX - rect.left) * scaleX;
  clampBasket();
}

canvas.addEventListener("mousemove", (e) => {
  if (running) setBasketFromClientX(e.clientX);
});

canvas.addEventListener(
  "touchmove",
  (e) => {
    if (!running) return;
    e.preventDefault();
    setBasketFromClientX(e.touches[0].clientX);
  },
  { passive: false }
);

function clampBasket() {
  basketX = Math.max(
    PLATFORM_WIDTH / 2,
    Math.min(canvas.width - PLATFORM_WIDTH / 2, basketX)
  );
}
