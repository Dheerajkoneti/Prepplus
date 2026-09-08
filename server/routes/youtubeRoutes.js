const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  generateMindMap,
  getMindMaps,
  deleteMindMap,
} = require("../controllers/youtubeController");

router.post(
  "/generate",
  protect,
  generateMindMap
);

router.get(
  "/history",
  protect,
  getMindMaps
);

router.delete(
  "/:id",
  protect,
  deleteMindMap
);

module.exports = router;