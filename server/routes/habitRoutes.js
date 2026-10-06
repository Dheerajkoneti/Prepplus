const express = require("express");

const router =
  express.Router();

const {
  getHabits,
  createHabit,
  updateHabit,
  toggleHabit,
  deleteHabit,
  getHabitSummary,
} = require("../controllers/habitController");

const {
  protect,
} = require("../middleware/authMiddleware");

/* =========================================================
   HABITS
========================================================= */

router.get(
  "/",
  protect,
  getHabits
);

router.post(
  "/",
  protect,
  createHabit
);

router.put(
  "/:id",
  protect,
  updateHabit
);

router.patch(
  "/:id/toggle",
  protect,
  toggleHabit
);

router.delete(
  "/:id",
  protect,
  deleteHabit
);

/* =========================================================
   SUMMARY
========================================================= */

router.get(
  "/summary",
  protect,
  getHabitSummary
);

module.exports = router;