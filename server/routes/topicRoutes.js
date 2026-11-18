const express = require("express");

const router = express.Router();

const {
  getTopic,
  createTopic,
  updateTopic,
  getTopicStatus,
} = require("../controllers/topicController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");


// =========================================================
// STUDENT ROUTES
// =========================================================

// Get topic
router.get(
  "/:topicId",
  protect,
  getTopic
);


// Get topic status
router.get(
  "/:topicId/status",
  protect,
  getTopicStatus
);


// =========================================================
// ADMIN ROUTES
// =========================================================

// Create topic
router.post(
  "/",
  protect,
  adminOnly,
  createTopic
);


// Update topic
router.put(
  "/:topicId",
  protect,
  adminOnly,
  updateTopic
);


module.exports = router;