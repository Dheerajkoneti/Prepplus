const express = require("express");

const router =
  express.Router();

const {
  generateNotes,
  saveNote,
  getNotes,
  getNoteById,
  deleteNote,
} = require("../controllers/notesController");

const {
  protect,
} = require("../middleware/authMiddleware");

// ============================================================
// AI NOTES
// ============================================================

router.post(
  "/generate",
  protect,
  generateNotes
);

// ============================================================
// SAVE NOTE
// ============================================================

router.post(
  "/save",
  protect,
  saveNote
);

// ============================================================
// GET ALL NOTES
// ============================================================

router.get(
  "/",
  protect,
  getNotes
);

// ============================================================
// GET SINGLE NOTE
// ============================================================

router.get(
  "/:id",
  protect,
  getNoteById
);

// ============================================================
// DELETE NOTE
// ============================================================

router.delete(
  "/:id",
  protect,
  deleteNote
);

module.exports = router;