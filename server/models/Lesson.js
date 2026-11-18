const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
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

    type: {
      type: String,

      enum: [
        "video",
        "article",
        "pdf",
        "coding",
        "quiz",
      ],

      default: "video",
    },

    content: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    resourceUrl: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    order: {
      type: Number,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);


lessonSchema.index({
  topicId: 1,
  order: 1,
});


module.exports = mongoose.model(
  "Lesson",
  lessonSchema
);