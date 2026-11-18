const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null,
      index: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        type: String,
        required: true,
      },
    ],

    correctAnswer: {
      type: String,
      required: true,
    },

    explanation: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,

      enum: [
        "easy",
        "medium",
        "hard",
      ],

      default: "medium",
    },

    type: {
      type: String,

      enum: [
        "topic",
        "final",
      ],

      required: true,
    },
  },

  {
    timestamps: true,
  }
);


questionSchema.index({
  courseId: 1,
  type: 1,
});


questionSchema.index({
  topicId: 1,
  type: 1,
});


module.exports = mongoose.model(
  "Question",
  questionSchema
);