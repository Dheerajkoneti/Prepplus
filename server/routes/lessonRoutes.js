const express = require("express");

const router = express.Router();

const {
  getLesson,
  completeLesson,
} = require("../controllers/lessonController");

const { protect } = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| Student Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/:lessonId",
  protect,
  getLesson
);

router.post(
  "/:lessonId/complete",
  protect,
  completeLesson
);

module.exports = router;