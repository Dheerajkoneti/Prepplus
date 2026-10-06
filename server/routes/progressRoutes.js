const express = require("express");

const router = express.Router();

const {
  getProgressAnalytics,
  recordLoginStreak,
} = require("../controllers/progressController");

const {
  protect,
} = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| PROGRESS ANALYTICS
|--------------------------------------------------------------------------
*/

router.get(
  "/analytics",
  protect,
  getProgressAnalytics
);

/*
|--------------------------------------------------------------------------
| DAILY LOGIN STREAK
|--------------------------------------------------------------------------
*/

router.post(
  "/login-streak",
  protect,
  recordLoginStreak
);

module.exports = router;