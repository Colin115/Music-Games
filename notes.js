// notes.js
// Shared note registry for all games

const NOTE_DEFS = {
  quarter: { name: "quarter", img: "quarter.svg" },
  half: { name: "half", img: "half.svg" },
  whole: { name: "whole", img: "whole.svg" },
  rest: { name: "rest", img: "rest.svg" },
};

// Preload images once
const NOTE_IMAGES = {};

for (const key in NOTE_DEFS) {
  const img = new Image();
  img.src = "../../assets/notes/" + NOTE_DEFS[key].img;
  NOTE_IMAGES[key] = img;
}

/* -------------------------------
   Public API (what games use)
-------------------------------- */

// Returns ALL notes (including rests)
function getAllNotes() {
  return Object.values(NOTE_DEFS);
}

// Returns playable notes only (no rests)
function getPlayableNotes() {
  return Object.values(NOTE_DEFS).filter(n => n.name !== "rest");
}

// Returns image for a note
function getNoteImage(note) {
  return NOTE_IMAGES[note.name];
}