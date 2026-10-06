const express = require("express");

const {
  getMockTests,
  getMockTestById,
  generateMockTest,
  startMockTest,
  getMockTestAttempt,
  getAttemptProgress,
  saveAnswer,
  markForReview,
  updateNavigation,
  heartbeat,
  abandonTest,
  getAttemptHistory,
  submitMockTest,
  getMockTestResult,
} = require("../controllers/mockTestController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| History
|--------------------------------------------------------------------------
*/

router.get(
  "/history",
  protect,
  getAttemptHistory
);

/*
|--------------------------------------------------------------------------
| Generate AI Mock Test
|--------------------------------------------------------------------------
*/

router.post(
  "/generate",
  protect,
  generateMockTest
);

/*
|--------------------------------------------------------------------------
| Get All Tests
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  getMockTests
);

/*
|--------------------------------------------------------------------------
| Get Test
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  protect,
  getMockTestById
);

/*
|--------------------------------------------------------------------------
| Start Test
|--------------------------------------------------------------------------
*/

router.post(
  "/:testId/start",
  protect,
  startMockTest
);

/*
|--------------------------------------------------------------------------
| Attempt
|--------------------------------------------------------------------------
*/

router.get(
  "/attempt/:attemptId",
  protect,
  getMockTestAttempt
);

router.get(
  "/attempt/:attemptId/progress",
  protect,
  getAttemptProgress
);

/*
|--------------------------------------------------------------------------
| Answer
|--------------------------------------------------------------------------
*/

router.patch(
  "/attempt/:attemptId/answer",
  protect,
  saveAnswer
);

/*
|--------------------------------------------------------------------------
| Review
|--------------------------------------------------------------------------
*/

router.patch(
  "/attempt/:attemptId/review",
  protect,
  markForReview
);

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

router.patch(
  "/attempt/:attemptId/navigation",
  protect,
  updateNavigation
);

/*
|--------------------------------------------------------------------------
| Heartbeat
|--------------------------------------------------------------------------
*/

router.patch(
  "/attempt/:attemptId/heartbeat",
  protect,
  heartbeat
);

/*
|--------------------------------------------------------------------------
| Abandon
|--------------------------------------------------------------------------
*/

router.post(
  "/attempt/:attemptId/abandon",
  protect,
  abandonTest
);
router.post(
  "/attempt/:attemptId/submit",
  protect,
  submitMockTest
);
router.get(
  "/result/:resultId",
  protect,
  getMockTestResult
);
module.exports =
  router;