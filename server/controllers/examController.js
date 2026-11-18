const Course = require("../models/Course");
const Topic = require("../models/Topic");
const Enrollment = require("../models/Enrollment");

const {
  calculateExamResult,
} = require("../services/examService");

const {
  calculateCourseProgress,
  areAllTopicsCompleted,
} = require("../services/progressService");

const {
  createCertificate,
} = require("../services/certificateService");


// ======================================================
// GET TOPIC EXAM
// GET /api/exams/topic/:topicId
// ======================================================

const getTopicExam = async (
  req,
  res
) => {
  try {

    const { topicId } =
      req.params;

    const topic =
      await Topic.findById(
        topicId
      ).populate({
        path: "examQuestions",
        select:
          "question options difficulty",
      });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message:
          "Topic not found.",
      });
    }

    const enrollment =
      await Enrollment.findOne({
        userId: req.user._id,
        courseId: topic.courseId,
      });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this course.",
      });
    }

    // --------------------------------------------------
    // Check lessons
    // --------------------------------------------------

    const allLessonsCompleted =
      topic.lessons.every(
        (lessonId) =>
          enrollment.completedLessons.some(
            (completedId) =>
              completedId.toString() ===
              lessonId.toString()
          )
      );

    if (!allLessonsCompleted) {
      return res.status(403).json({
        success: false,
        message:
          "Complete all lessons in this topic before starting the exam.",
      });
    }

    // --------------------------------------------------
    // Get questions without correct answers
    // --------------------------------------------------

    const questions =
      topic.examQuestions.map(
        (question) => ({
          _id: question._id,
          question:
            question.question,
          options:
            question.options,
          difficulty:
            question.difficulty,
        })
      );

    return res.status(200).json({
      success: true,

      topic: {
        _id: topic._id,
        title: topic.title,
        passingPercentage:
          topic.passingPercentage,
      },

      questions,
    });

  } catch (error) {

    console.error(
      "Get Topic Exam Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load topic exam.",
    });
  }
};


// ======================================================
// SUBMIT TOPIC EXAM
// POST /api/exams/topic/:topicId/submit
// ======================================================

const submitTopicExam = async (
  req,
  res
) => {
  try {

    const { topicId } =
      req.params;

    const {
      answers = [],
    } = req.body;

    const topic =
      await Topic.findById(
        topicId
      );

    if (!topic) {
      return res.status(404).json({
        success: false,
        message:
          "Topic not found.",
      });
    }

    const enrollment =
      await Enrollment.findOne({
        userId: req.user._id,
        courseId: topic.courseId,
      });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this course.",
      });
    }

    // --------------------------------------------------
    // Check lessons
    // --------------------------------------------------

    const allLessonsCompleted =
      topic.lessons.every(
        (lessonId) =>
          enrollment.completedLessons.some(
            (completedId) =>
              completedId.toString() ===
              lessonId.toString()
          )
      );

    if (!allLessonsCompleted) {
      return res.status(403).json({
        success: false,
        message:
          "Complete all lessons before taking the exam.",
      });
    }

    // --------------------------------------------------
    // Calculate result
    // --------------------------------------------------

    const result =
      await calculateExamResult({
        userId:
          req.user._id,

        courseId:
          topic.courseId,

        topicId,

        type: "topic",

        answers,

        passingPercentage:
          topic.passingPercentage,
      });

    // --------------------------------------------------
    // Find topic score
    // --------------------------------------------------

    let scoreRecord =
      enrollment.topicScores.find(
        (item) =>
          item.topicId &&
          item.topicId.toString() ===
            topicId.toString()
      );

    if (!scoreRecord) {

      enrollment.topicScores.push({
        topicId,

        score:
          result.score,

        attempts: 1,

        passed:
          result.passed,
      });

    } else {

      scoreRecord.score =
        result.score;

      scoreRecord.attempts += 1;

      scoreRecord.passed =
        result.passed;
    }

    // --------------------------------------------------
    // If passed, complete topic
    // --------------------------------------------------

    if (result.passed) {

      const alreadyCompleted =
        enrollment.completedTopics.some(
          (id) =>
            id.toString() ===
            topicId.toString()
        );

      if (!alreadyCompleted) {

        enrollment.completedTopics.push(
          topicId
        );
      }
    }

    await enrollment.save();

    // --------------------------------------------------
    // Recalculate course progress
    // --------------------------------------------------

    const progress =
      await calculateCourseProgress(
        enrollment._id
      );

    return res.status(200).json({
      success: true,

      result: {
        score:
          result.score,

        correctAnswers:
          result.correctAnswers,

        totalQuestions:
          result.totalQuestions,

        passed:
          result.passed,

        passingPercentage:
          result.passingPercentage,
      },

      topicCompleted:
        result.passed,

      courseProgress:
        progress.percentage,

      completedTopics:
        progress.completedTopics,

      totalTopics:
        progress.totalTopics,
    });

  } catch (error) {

    console.error(
      "Submit Topic Exam Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to submit topic exam.",
    });
  }
};


// ======================================================
// GET FINAL EXAM
// GET /api/exams/final/:courseId
// ======================================================

const getFinalExam = async (
  req,
  res
) => {
  try {

    const { courseId } =
      req.params;

    const course =
      await Course.findById(
        courseId
      ).populate({
        path: "finalExamQuestions",
        select:
          "question options difficulty",
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message:
          "Course not found.",
      });
    }

    const enrollment =
      await Enrollment.findOne({
        userId: req.user._id,
        courseId,
      });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this course.",
      });
    }

    const allTopicsCompleted =
      await areAllTopicsCompleted(
        enrollment
      );

    if (!allTopicsCompleted) {
      return res.status(403).json({
        success: false,
        message:
          "Complete all course topics before taking the final exam.",
        progress:
          enrollment.progressPercentage,
      });
    }

    const questions =
      course.finalExamQuestions.map(
        (question) => ({
          _id: question._id,
          question:
            question.question,
          options:
            question.options,
          difficulty:
            question.difficulty,
        })
      );

    return res.status(200).json({
      success: true,

      course: {
        _id: course._id,
        title: course.title,

        passingPercentage:
          course.passingPercentage,
      },

      questions,
    });

  } catch (error) {

    console.error(
      "Get Final Exam Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load final exam.",
    });
  }
};


// ======================================================
// SUBMIT FINAL EXAM
// POST /api/exams/final/:courseId/submit
// ======================================================

const submitFinalExam = async (
  req,
  res
) => {
  try {

    const { courseId } =
      req.params;

    const {
      answers = [],
    } = req.body;

    const course =
      await Course.findById(
        courseId
      );

    if (!course) {
      return res.status(404).json({
        success: false,
        message:
          "Course not found.",
      });
    }

    const enrollment =
      await Enrollment.findOne({
        userId: req.user._id,
        courseId,
      });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this course.",
      });
    }

    // --------------------------------------------------
    // Check all topics
    // --------------------------------------------------

    const allTopicsCompleted =
      await areAllTopicsCompleted(
        enrollment
      );

    if (!allTopicsCompleted) {
      return res.status(403).json({
        success: false,
        message:
          "Complete all topics before taking the final exam.",
      });
    }

    // --------------------------------------------------
    // Calculate result
    // --------------------------------------------------

    const result =
      await calculateExamResult({
        userId:
          req.user._id,

        courseId,

        topicId: null,

        type: "final",

        answers,

        passingPercentage:
          course.passingPercentage,
      });

    enrollment.finalExamScore =
      result.score;

    enrollment.finalExamAttempts +=
      1;

    enrollment.finalExamPassed =
      result.passed;

    // --------------------------------------------------
    // FINAL EXAM PASSED
    // --------------------------------------------------

    if (result.passed) {

      enrollment.progressPercentage =
        100;

      enrollment.courseCompleted =
        true;

      enrollment.certificateEligible =
        Boolean(
          course.certificateEnabled
        );

      enrollment.completedAt =
        new Date();

      await enrollment.save();

      let certificate = null;

      if (
        enrollment.certificateEligible
      ) {
        certificate =
          await createCertificate(
            req.user._id,
            courseId
          );
      }

      return res.status(200).json({
        success: true,

        result: {
          score:
            result.score,

          correctAnswers:
            result.correctAnswers,

          totalQuestions:
            result.totalQuestions,

          passed: true,

          passingPercentage:
            result.passingPercentage,
        },

        courseCompleted: true,

        certificateEligible:
          enrollment.certificateEligible,

        certificate,
      });
    }

    // --------------------------------------------------
    // FINAL EXAM FAILED
    // --------------------------------------------------

    enrollment.courseCompleted =
      false;

    enrollment.certificateEligible =
      false;

    await enrollment.save();

    return res.status(200).json({
      success: true,

      result: {
        score:
          result.score,

        correctAnswers:
          result.correctAnswers,

        totalQuestions:
          result.totalQuestions,

        passed: false,

        passingPercentage:
          result.passingPercentage,
      },

      courseCompleted: false,

      certificateEligible: false,

      message:
        "Final exam not passed. You can retry the exam.",
    });

  } catch (error) {

    console.error(
      "Submit Final Exam Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to submit final exam.",
    });
  }
};


module.exports = {
  getTopicExam,
  submitTopicExam,
  getFinalExam,
  submitFinalExam,
};