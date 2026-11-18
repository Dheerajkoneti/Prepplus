const express = require("express");

const router = express.Router();

const {
  getLanguages,
  getCourses,
  getCoursesByLanguage,
  getCourse,
  enrollCourse,
  getCourseProgress,
} = require("../controllers/courseController");

const {
  protect,
} = require("../middleware/authMiddleware");


// =========================================================
// PUBLIC COURSE ROUTES
// =========================================================

// Get available programming languages
router.get(
  "/languages",
  getLanguages
);


// Get all published courses
router.get(
  "/",
  getCourses
);


// Get courses by language
router.get(
  "/language/:language",
  getCoursesByLanguage
);


// =========================================================
// PROTECTED COURSE ROUTES
// =========================================================

// Get course details
router.get(
  "/:courseId",
  protect,
  getCourse
);


// Enroll in course
router.post(
  "/:courseId/enroll",
  protect,
  enrollCourse
);


// Get user's progress
router.get(
  "/:courseId/progress",
  protect,
  getCourseProgress
);


module.exports = router;