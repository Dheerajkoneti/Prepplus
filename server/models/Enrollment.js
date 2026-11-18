const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    completedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],

    topicScores: [
      {
        topicId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic",
        },

        score: {
          type: Number,
          default: 0,
        },

        attempts: {
          type: Number,
          default: 0,
        },

        passed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    finalExamScore: {
      type: Number,
      default: 0,
    },

    finalExamAttempts: {
      type: Number,
      default: 0,
    },

    finalExamPassed: {
      type: Boolean,
      default: false,
    },

    courseCompleted: {
      type: Boolean,
      default: false,
    },

    certificateEligible: {
      type: Boolean,
      default: false,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);


// Prevent duplicate enrollment
enrollmentSchema.index(
  {
    userId: 1,
    courseId: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model(
  "Enrollment",
  enrollmentSchema
);