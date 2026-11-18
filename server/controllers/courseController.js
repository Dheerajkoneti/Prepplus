const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const {
  getUserCourseProgress,
} = require("../services/progressService");


// ======================================================
// GET AVAILABLE LANGUAGES
// GET /api/courses/languages
// ======================================================

const getLanguages = async (req, res) => {
  try {
    console.log(
      "📚 Fetching course languages..."
    );

    const courses =
      await Course.find({
        published: true,
      }).select(
        "language"
      );

    const languageMap = {};

    courses.forEach((course) => {
      const language =
        course.language?.trim();

      if (!language) {
        return;
      }

      if (!languageMap[language]) {
        languageMap[language] = 0;
      }

      languageMap[language]++;
    });

    const languages =
      Object.keys(languageMap)
        .sort()
        .map((language) => ({
          name: language,

          courseCount:
            languageMap[language],
        }));

    console.log(
      "✅ Languages found:",
      languages
    );

    return res.status(200).json({
      success: true,

      languages,
    });

  } catch (error) {
    console.error(
      "❌ GET LANGUAGES ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch available languages.",

      error: error.message,
    });
  }
};
// ======================================================
// GET ALL PUBLISHED COURSES
// GET /api/courses
// ======================================================

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      published: true,
    })
      .populate({
        path: "topics",

        select:
          "_id title description order lessons passingPercentage estimatedMinutes",

        populate: {
          path: "lessons",

          select:
            "_id title description type duration order",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count: courses.length,

      courses,
    });

  } catch (error) {
    console.error(
      "Get Courses Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch courses.",

      error: error.message,
    });
  }
};


// ======================================================
// GET COURSES BY LANGUAGE
// GET /api/courses/language/:language
// ======================================================

const getCoursesByLanguage = async (
  req,
  res
) => {
  try {
    const { language } = req.params;

    if (!language) {
      return res.status(400).json({
        success: false,

        message:
          "Language is required.",
      });
    }

    const courses = await Course.find({
      language: {
        $regex: `^${language}$`,

        $options: "i",
      },

      published: true,
    })
      .populate({
        path: "topics",

        select:
          "_id title description order lessons passingPercentage estimatedMinutes",

        populate: {
          path: "lessons",

          select:
            "_id title description type duration order",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      language,

      count: courses.length,

      courses,
    });

  } catch (error) {
    console.error(
      "Get Courses By Language Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch courses.",

      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE COURSE
// GET /api/courses/:courseId
// ======================================================

const getCourse = async (
  req,
  res
) => {
  try {
    const { courseId } =
      req.params;

    const course =
      await Course.findOne({
        _id: courseId,

        published: true,
      }).populate({
        path: "topics",

        populate: {
          path: "lessons",

          select:
            "_id title description type content videoUrl resourceUrl duration order",

          options: {
            sort: {
              order: 1,
            },
          },
        },
      });

    if (!course) {
      return res.status(404).json({
        success: false,

        message:
          "Course not found.",
      });
    }

    let progress = null;

    if (req.user) {
      progress =
        await getUserCourseProgress(
          req.user._id,

          courseId
        );
    }

    return res.status(200).json({
      success: true,

      course,

      progress,
    });

  } catch (error) {
    console.error(
      "Get Course Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch course.",

      error: error.message,
    });
  }
};


// ======================================================
// ENROLL IN COURSE
// POST /api/courses/:courseId/enroll
// ======================================================

const enrollCourse = async (
  req,
  res
) => {
  try {
    const { courseId } =
      req.params;

    const userId =
      req.user._id;

    const course =
      await Course.findOne({
        _id: courseId,

        published: true,
      });

    if (!course) {
      return res.status(404).json({
        success: false,

        message:
          "Course not found.",
      });
    }

    let enrollment =
      await Enrollment.findOne({
        userId,

        courseId,
      });

    if (enrollment) {
      return res.status(200).json({
        success: true,

        alreadyEnrolled: true,

        message:
          "You are already enrolled in this course.",

        enrollment,
      });
    }

    enrollment =
      await Enrollment.create({
        userId,

        courseId,
      });

    return res.status(201).json({
      success: true,

      alreadyEnrolled: false,

      message:
        "Course enrollment successful.",

      enrollment,
    });

  } catch (error) {
    console.error(
      "Enroll Course Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to enroll in course.",

      error: error.message,
    });
  }
};


// ======================================================
// GET COURSE PROGRESS
// GET /api/courses/:courseId/progress
// ======================================================

const getCourseProgress = async (
  req,
  res
) => {
  try {
    const { courseId } =
      req.params;

    const userId =
      req.user._id;

    const progress =
      await getUserCourseProgress(
        userId,

        courseId
      );

    if (!progress) {
      return res.status(404).json({
        success: false,

        message:
          "You are not enrolled in this course.",
      });
    }

    return res.status(200).json({
      success: true,

      ...progress,
    });

  } catch (error) {
    console.error(
      "Get Course Progress Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch course progress.",

      error: error.message,
    });
  }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  getLanguages,

  getCourses,

  getCoursesByLanguage,

  getCourse,

  enrollCourse,

  getCourseProgress,
};