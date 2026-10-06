const express = require("express");

const {
  startInterview,
  submitAnswer,
  getInterviewReport,
  getInterviewResult,
  getInterviewById,
  recordSecurityEvent,
  getMyInterviewReports,
} = require("../controllers/mockInterviewController");

const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const router = express.Router();

// ======================================================
// START INTERVIEW
// ======================================================

router.post(
  "/start",
  protect,
  upload.single("resume"),
  startInterview
);

// ======================================================
// GET ALL LOGGED-IN USER REPORTS
// IMPORTANT:
// THIS MUST COME BEFORE /:id
// ======================================================

router.get(
  "/my-reports",
  protect,
  getMyInterviewReports
);

// ======================================================
// GET SINGLE INTERVIEW
// ======================================================

router.get(
  "/:id",
  protect,
  getInterviewById
);

// ======================================================
// SUBMIT ANSWER
// ======================================================

router.post(
  "/:id/answer",
  protect,
  submitAnswer
);

// ======================================================
// SECURITY EVENT
// ======================================================

router.post(
  "/:id/security-event",
  protect,
  recordSecurityEvent
);

// ======================================================
// FINAL REPORT
// ======================================================

router.get(
  "/:id/report",
  protect,
  getInterviewReport
);

// ======================================================
// SINGLE RESULT
// ======================================================

router.get(
  "/:id/result",
  protect,
  getInterviewResult
);

module.exports = router;