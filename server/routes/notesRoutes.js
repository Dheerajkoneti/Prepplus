const express = require("express");
const router = express.Router();

const {
  generateNotes,
  saveNote,
  getNotes,
  getNoteById,
  deleteNote,
} = require("../controllers/notesController");

const { protect } = require("../middleware/authMiddleware");

// Generate AI Notes
router.post("/generate", generateNotes);

// Save Note
router.post("/save", protect, saveNote);

// Get Notes
router.get("/", protect, getNotes);

// Get Single Note
router.get("/:id", protect, getNoteById);

// Delete Note
router.delete("/:id", protect, deleteNote);

module.exports = router;