const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      required: true,
    },

    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    examQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    passingPercentage: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },

    estimatedMinutes: {
      type: Number,
      default: 30,
    },
  },

  {
    timestamps: true,
  }
);


// Index topics by course and order
topicSchema.index({
  courseId: 1,
  order: 1,
});


// IMPORTANT:
// Export the actual Mongoose model
module.exports = mongoose.model(
  "Topic",
  topicSchema
);