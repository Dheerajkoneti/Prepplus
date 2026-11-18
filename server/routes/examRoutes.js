const express = require("express");

const router = express.Router();

const {
  getTopicExam,
  submitTopicExam,
  getFinalExam,
  submitFinalExam,
} = require("../controllers/examController");

const {
  protect,
} = require("../middleware/authMiddleware");


// =========================================================
// TOPIC EXAM
// =========================================================

router.get(
  "/topic/:topicId",
  protect,
  getTopicExam
);


router.post(
  "/topic/:topicId/submit",
  protect,
  submitTopicExam
);


// =========================================================
// FINAL COURSE EXAM
// =========================================================

router.get(
  "/final/:courseId",
  protect,
  getFinalExam
);


router.post(
  "/final/:courseId/submit",
  protect,
  submitFinalExam
);


module.exports = router;