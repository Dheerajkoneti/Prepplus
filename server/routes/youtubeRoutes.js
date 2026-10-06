const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  generateMindMap,
  generateMindMapStream,
  getMindMaps,
  getMindMapById,
  deleteMindMap,
} = require("../controllers/youtubeController");

// ============================================================
// GENERATE
// ============================================================

router.post(
  "/generate",
  protect,
  generateMindMap
);

// ============================================================
// REAL-TIME GENERATE
// ============================================================

router.post(
  "/generate-stream",
  protect,
  generateMindMapStream
);

// ============================================================
// HISTORY
// IMPORTANT: /history must come BEFORE /:id
// ============================================================

router.get(
  "/history",
  protect,
  getMindMaps
);

// ============================================================
// GET ONE
// ============================================================

router.get(
  "/:id",
  protect,
  getMindMapById
);

// ============================================================
// DELETE
// ============================================================

router.delete(
  "/:id",
  protect,
  deleteMindMap
);

module.exports = router;