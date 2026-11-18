const Course = require("../models/Course");
const Topic = require("../models/Topic");
const Enrollment = require("../models/Enrollment");

/**
 * Check whether a MongoDB ObjectId exists
 * inside an array of ObjectIds.
 */
const containsId = (array = [], id) => {
  return array.some(
    (item) =>
      item.toString() === id.toString()
  );
};


/**
 * Calculate and save course progress.
 *
 * Progress is based on completed topics.
 *
 * completed topics / total topics * 100
 */
const calculateCourseProgress = async (
  enrollmentId
) => {
  const enrollment =
    await Enrollment.findById(
      enrollmentId
    );

  if (!enrollment) {
    throw new Error(
      "Enrollment not found."
    );
  }

  const course =
    await Course.findById(
      enrollment.courseId
    );

  if (!course) {
    throw new Error(
      "Course not found."
    );
  }

  const totalTopics =
    course.topics.length;

  const completedTopics =
    enrollment.completedTopics.length;

  let percentage = 0;

  if (totalTopics > 0) {
    percentage = Math.round(
      (completedTopics /
        totalTopics) *
        100
    );
  }

  // Never allow progress above 100%.
  if (percentage > 100) {
    percentage = 100;
  }

  enrollment.progressPercentage =
    percentage;

  await enrollment.save();

  return {
    percentage,
    totalTopics,
    completedTopics,
  };
};


/**
 * Check whether all lessons belonging
 * to a topic have been completed.
 */
const checkTopicLessonsCompleted = async (
  userId,
  topicId
) => {
  const topic =
    await Topic.findById(
      topicId
    );

  if (!topic) {
    throw new Error(
      "Topic not found."
    );
  }

  const enrollment =
    await Enrollment.findOne({
      userId,
      courseId: topic.courseId,
    });

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course."
    );
  }

  const totalLessons =
    topic.lessons.length;

  const completedLessons =
    topic.lessons.filter(
      (lessonId) =>
        containsId(
          enrollment.completedLessons,
          lessonId
        )
    ).length;

  return {
    totalLessons,

    completedLessons,

    completed:
      totalLessons > 0 &&
      totalLessons ===
        completedLessons,
  };
};


/**
 * Check whether the user can access
 * a particular topic.
 *
 * Topic 1:
 * Always unlocked.
 *
 * Topic 2:
 * Requires Topic 1 completion.
 *
 * Topic 3:
 * Requires Topic 2 completion.
 *
 * And so on.
 */
const canAccessTopic = async (
  userId,
  topicId
) => {
  const topic =
    await Topic.findById(
      topicId
    );

  if (!topic) {
    throw new Error(
      "Topic not found."
    );
  }

  const course =
    await Course.findById(
      topic.courseId
    ).populate({
      path: "topics",
      select:
        "_id title order",
    });

  if (!course) {
    throw new Error(
      "Course not found."
    );
  }

  const enrollment =
    await Enrollment.findOne({
      userId,
      courseId: course._id,
    });

  if (!enrollment) {
    return {
      allowed: false,

      reason:
        "You are not enrolled in this course.",
    };
  }

  // Sort topics according to their order.
  const topics =
    [...course.topics].sort(
      (a, b) =>
        a.order - b.order
    );

  const currentIndex =
    topics.findIndex(
      (item) =>
        item._id.toString() ===
        topicId.toString()
    );

  if (currentIndex === -1) {
    return {
      allowed: false,

      reason:
        "Topic does not belong to this course.",
    };
  }

  // --------------------------------------------
  // First topic is always unlocked.
  // --------------------------------------------

  if (currentIndex === 0) {
    return {
      allowed: true,

      previousTopic: null,
    };
  }

  // --------------------------------------------
  // Get previous topic.
  // --------------------------------------------

  const previousTopic =
    topics[currentIndex - 1];

  const previousCompleted =
    containsId(
      enrollment.completedTopics,
      previousTopic._id
    );

  // --------------------------------------------
  // Previous topic not completed.
  // --------------------------------------------

  if (!previousCompleted) {
    return {
      allowed: false,

      previousTopic: {
        _id:
          previousTopic._id,

        title:
          previousTopic.title,

        order:
          previousTopic.order,
      },

      reason:
        "Complete the previous topic first.",
    };
  }

  // --------------------------------------------
  // Topic unlocked.
  // --------------------------------------------

  return {
    allowed: true,

    previousTopic: {
      _id:
        previousTopic._id,

      title:
        previousTopic.title,

      order:
        previousTopic.order,
    },
  };
};


/**
 * Get complete course progress
 * for the logged-in student.
 */
const getUserCourseProgress = async (
  userId,
  courseId
) => {
  const enrollment =
    await Enrollment.findOne({
      userId,
      courseId,
    });

  if (!enrollment) {
    return null;
  }

  const course =
    await Course.findById(
      courseId
    ).populate({
      path: "topics",

      select:
        "_id title description order lessons passingPercentage estimatedMinutes",
    });

  if (!course) {
    throw new Error(
      "Course not found."
    );
  }

  // --------------------------------------------
  // Sort topics first.
  // --------------------------------------------

  const sortedTopics =
    [...course.topics].sort(
      (a, b) =>
        a.order - b.order
    );

  // --------------------------------------------
  // Create progress information.
  // --------------------------------------------

  const topics =
    sortedTopics.map(
      (topic, index) => {

        const completed =
          containsId(
            enrollment.completedTopics,
            topic._id
          );

        // Find topic score.
        const scoreRecord =
          enrollment.topicScores.find(
            (item) =>
              item.topicId &&
              item.topicId.toString() ===
                topic._id.toString()
          );

        // ----------------------------------------
        // Determine whether topic is unlocked.
        // ----------------------------------------

        let unlocked = false;

        // First topic is always unlocked.
        if (index === 0) {
          unlocked = true;
        } else {

          const previousTopic =
            sortedTopics[
              index - 1
            ];

          unlocked =
            containsId(
              enrollment.completedTopics,
              previousTopic._id
            );
        }

        return {
          topicId:
            topic._id,

          title:
            topic.title,

          description:
            topic.description,

          order:
            topic.order,

          lessonCount:
            topic.lessons.length,

          completed,

          unlocked,

          score:
            scoreRecord?.score || 0,

          attempts:
            scoreRecord?.attempts || 0,

          passed:
            scoreRecord?.passed ||
            false,
        };
      }
    );

  return {
    enrollment,

    courseId:
      course._id,

    courseTitle:
      course.title,

    percentage:
      enrollment.progressPercentage,

    completedTopics:
      enrollment.completedTopics.length,

    totalTopics:
      course.topics.length,

    finalExamScore:
      enrollment.finalExamScore,

    finalExamAttempts:
      enrollment.finalExamAttempts,

    finalExamPassed:
      enrollment.finalExamPassed,

    courseCompleted:
      enrollment.courseCompleted,

    certificateEligible:
      enrollment.certificateEligible,

    topics,
  };
};


/**
 * Check whether every topic in a course
 * has been completed.
 */
const areAllTopicsCompleted = async (
  enrollment
) => {
  if (!enrollment) {
    return false;
  }

  const course =
    await Course.findById(
      enrollment.courseId
    );

  if (!course) {
    throw new Error(
      "Course not found."
    );
  }

  const totalTopics =
    course.topics.length;

  const completedTopics =
    enrollment.completedTopics.length;

  return (
    totalTopics > 0 &&
    completedTopics >=
      totalTopics
  );
};


/**
 * Get topic progress for a particular user.
 *
 * Useful for showing:
 *
 * Lessons: 2 / 5
 * Progress: 40%
 */
const getTopicProgress = async (
  userId,
  topicId
) => {
  const topic =
    await Topic.findById(
      topicId
    );

  if (!topic) {
    throw new Error(
      "Topic not found."
    );
  }

  const enrollment =
    await Enrollment.findOne({
      userId,
      courseId:
        topic.courseId,
    });

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course."
    );
  }

  const totalLessons =
    topic.lessons.length;

  const completedLessons =
    topic.lessons.filter(
      (lessonId) =>
        containsId(
          enrollment.completedLessons,
          lessonId
        )
    ).length;

  const percentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons /
            totalLessons) *
            100
        )
      : 0;

  return {
    topicId:
      topic._id,

    totalLessons,

    completedLessons,

    percentage,

    completed:
      totalLessons > 0 &&
      completedLessons ===
        totalLessons,
  };
};


module.exports = {
  calculateCourseProgress,

  checkTopicLessonsCompleted,

  canAccessTopic,

  getUserCourseProgress,

  areAllTopicsCompleted,

  getTopicProgress,
};