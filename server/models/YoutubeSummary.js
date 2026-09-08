const mongoose = require("mongoose");

const youtubeSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },

    transcript: {
      type: String,
      default: "",
    },

    mindMap: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "YoutubeSummary",
  youtubeSummarySchema
);