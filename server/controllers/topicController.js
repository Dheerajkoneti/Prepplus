const Topic = require("../models/Topic");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const {
  checkTopicLessonsCompleted,
  canAccessTopic,
} = require("../services/progressService");


// ======================================================
// GET TOPIC
// GET /api/topics/:topicId
// ======================================================

const getTopic = async (
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
        path: "lessons",
        select:
          "_id title description type content videoUrl resourceUrl duration order",
        options: {
          sort: {
            order: 1,
          },
        },
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

    const access =
      await canAccessTopic(
        req.user._id,
        topicId
      );

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message:
          access.reason ||
          "This topic is locked.",
        previousTopic:
          access.previousTopic || null,
      });
    }

    const completed =
      enrollment.completedTopics.some(
        (id) =>
          id.toString() ===
          topic._id.toString()
      );

    return res.status(200).json({
      success: true,

      topic,

      completedLessons:
        enrollment.completedLessons,

      completed,

      access,
    });

  } catch (error) {

    console.error(
      "Get Topic Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch topic.",
    });
  }
};


// ======================================================
// CREATE TOPIC - ADMIN
// POST /api/topics
// ======================================================

const createTopic = async (
  req,
  res
) => {
  try {

    const {
      courseId,
      title,
      description = "",
      order,
      passingPercentage = 70,
      estimatedMinutes = 30,
    } = req.body;

    if (
      !courseId ||
      !title ||
      order === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "courseId, title and order are required.",
      });
    }

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

    const existingTopic =
      await Topic.findOne({
        courseId,
        order,
      });

    if (existingTopic) {
      return res.status(409).json({
        success: false,
        message:
          "A topic with this order already exists in this course.",
      });
    }

    const topic =
      await Topic.create({
        courseId,
        title,
        description,
        order,
        passingPercentage,
        estimatedMinutes,
      });

    course.topics.push(
      topic._id
    );

    await course.save();

    return res.status(201).json({
      success: true,
      message:
        "Topic created successfully.",
      topic,
    });

  } catch (error) {

    console.error(
      "Create Topic Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create topic.",
    });
  }
};


// ======================================================
// UPDATE TOPIC - ADMIN
// PUT /api/topics/:topicId
// ======================================================

const updateTopic = async (
  req,
  res
) => {
  try {

    const { topicId } =
      req.params;

    const topic =
      await Topic.findByIdAndUpdate(
        topicId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!topic) {
      return res.status(404).json({
        success: false,
        message:
          "Topic not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Topic updated successfully.",
      topic,
    });

  } catch (error) {

    console.error(
      "Update Topic Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update topic.",
    });
  }
};


// ======================================================
// GET TOPIC STATUS
// GET /api/topics/:topicId/status
// ======================================================

const getTopicStatus = async (
  req,
  res
) => {
  try {

    const { topicId } =
      req.params;

    const status =
      await checkTopicLessonsCompleted(
        req.user._id,
        topicId
      );

    return res.status(200).json({
      success: true,
      ...status,
    });

  } catch (error) {

    console.error(
      "Get Topic Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to get topic status.",
    });
  }
};


module.exports = {
  getTopic,
  createTopic,
  updateTopic,
  getTopicStatus,
};