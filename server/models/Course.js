const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    language: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    level: {
      type: String,

      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],

      default: "Beginner",
    },

    duration: {
      type: Number,
      default: 0,
    },

    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],

    finalExamQuestions: [
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

    certificateEnabled: {
      type: Boolean,

      default: true,
    },

    published: {
      type: Boolean,

      default: false,
    },
  },

  {
    timestamps: true,
  }
);


// Index for language filtering
courseSchema.index({
  language: 1,
  published: 1,
});


// Export the actual Mongoose model
module.exports =
  mongoose.model(
    "Course",
    courseSchema
  );