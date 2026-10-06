const mongoose = require("mongoose");

const youtubeSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },

    videoId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    title: {
      type: String,
      default: "YouTube Study Mind Map",
      trim: true,
    },

    userPrompt: {
      type: String,
      default: "",
      trim: true,
    },

    transcript: {
      type: String,
      default: "",
    },

    mindMap: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PROCESSING",
        "COMPLETED",
        "FAILED",
      ],
      default: "COMPLETED",
      index: true,
    },

    processingTimeMs: {
      type: Number,
      default: 0,
    },

    transcriptLength: {
      type: Number,
      default: 0,
    },

    model: {
      type: String,
      default: "",
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

youtubeSummarySchema.index({
  userId: 1,
  createdAt: -1,
});

youtubeSummarySchema.index({
  userId: 1,
  videoId: 1,
});

module.exports = mongoose.model(
  "YoutubeSummary",
  youtubeSummarySchema
);