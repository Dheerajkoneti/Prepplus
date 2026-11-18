const Lesson = require("../models/Lesson");
const Topic = require("../models/Topic");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

/*
|--------------------------------------------------------------------------
| GET SINGLE LESSON
|--------------------------------------------------------------------------
*/

const getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    const topic = await Topic.findById(lesson.topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: topic.courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    const completed = enrollment.completedLessons.some(
      (id) => id.toString() === lesson._id.toString()
    );

    return res.status(200).json({
      success: true,

      lesson: {
        ...lesson.toObject(),
        completed,
      },
    });
  } catch (error) {
    console.error("❌ GET LESSON ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load lesson.",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| COMPLETE LESSON
|--------------------------------------------------------------------------
*/

const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    console.log("\n====================================");
    console.log("🔥 COMPLETE LESSON");
    console.log("User:", req.user._id.toString());
    console.log("Lesson:", lessonId);
    console.log("====================================");

    /*
    |--------------------------------------------------------------------------
    | Find lesson
    |--------------------------------------------------------------------------
    */

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find topic
    |--------------------------------------------------------------------------
    */

    const topic = await Topic.findById(lesson.topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find course
    |--------------------------------------------------------------------------
    */

    const course = await Course.findById(topic.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find enrollment
    |--------------------------------------------------------------------------
    */

    const enrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: course._id,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get ALL lessons for this topic
    |--------------------------------------------------------------------------
    */

    const lessons = await Lesson.find({
      topicId: topic._id,
    }).sort({
      order: 1,
    });

    /*
    |--------------------------------------------------------------------------
    | Current lesson index
    |--------------------------------------------------------------------------
    */

    const currentIndex = lessons.findIndex(
      (item) =>
        item._id.toString() === lesson._id.toString()
    );

    if (currentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Lesson does not belong to this topic.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT:
    | Check whether THIS EXACT lesson is already completed
    |--------------------------------------------------------------------------
    */

    const alreadyCompleted =
      enrollment.completedLessons.some(
        (id) =>
          id.toString() === lesson._id.toString()
      );

    console.log(
      "Current lesson already completed:",
      alreadyCompleted
    );

    /*
    |--------------------------------------------------------------------------
    | Add current lesson
    |--------------------------------------------------------------------------
    */

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(
        lesson._id
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate completed lessons
    |--------------------------------------------------------------------------
    */

    const completedLessons = lessons.filter(
      (item) =>
        enrollment.completedLessons.some(
          (completedId) =>
            completedId.toString() ===
            item._id.toString()
        )
    ).length;

    const totalLessons = lessons.length;

    const allLessonsCompleted =
      totalLessons > 0 &&
      completedLessons === totalLessons;

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    await enrollment.save();

    /*
    |--------------------------------------------------------------------------
    | Build fresh lesson state from DB
    |--------------------------------------------------------------------------
    */

    const freshEnrollment =
      await Enrollment.findById(
        enrollment._id
      );

    const updatedLessons = lessons.map(
      (item) => ({
        _id: item._id,
        title: item.title,
        description: item.description,
        type: item.type,
        content: item.content,
        videoUrl: item.videoUrl,
        resourceUrl: item.resourceUrl,
        duration: item.duration,
        order: item.order,

        completed:
          freshEnrollment.completedLessons.some(
            (id) =>
              id.toString() ===
              item._id.toString()
          ),
      })
    );

    /*
    |--------------------------------------------------------------------------
    | Find next incomplete lesson
    |--------------------------------------------------------------------------
    */

    const nextLesson =
      updatedLessons.find(
        (item) => !item.completed
      ) || null;

    /*
    |--------------------------------------------------------------------------
    | LOG EVERYTHING
    |--------------------------------------------------------------------------
    */

    console.log("------------------------------------");

    console.log(
      "Current lesson:",
      lesson.title
    );

    console.log(
      "Current lesson ID:",
      lesson._id.toString()
    );

    console.log(
      "Completed lessons:",
      completedLessons
    );

    console.log(
      "Total lessons:",
      totalLessons
    );

    console.log(
      "All lessons completed:",
      allLessonsCompleted
    );

    console.log(
      "Next incomplete lesson:",
      nextLesson
        ? `${nextLesson.title} (${nextLesson._id})`
        : "NONE"
    );

    console.log("------------------------------------");

    /*
    |--------------------------------------------------------------------------
    | FINAL RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message: allLessonsCompleted
        ? "Lesson completed. Topic exam unlocked."
        : "Lesson completed successfully.",

      lesson: {
        _id: lesson._id,
        title: lesson.title,
        completed: true,
      },

      progress: {
        completedLessons,
        totalLessons,
        percentage:
          totalLessons > 0
            ? Math.round(
                (completedLessons /
                  totalLessons) *
                  100
              )
            : 0,
      },

      lessons: updatedLessons,

      next: {
        hasNextLesson:
          !allLessonsCompleted &&
          Boolean(nextLesson),

        lessonId:
          nextLesson?._id || null,

        topicExamUnlocked:
          allLessonsCompleted,
      },
    });
  } catch (error) {
    console.error(
      "❌ COMPLETE LESSON ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete lesson.",
      error: error.message,
    });
  }
};

module.exports = {
  getLesson,
  completeLesson,
};