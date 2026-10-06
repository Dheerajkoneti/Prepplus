const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalTests: {
      type: Number,
      default: 0,
    },

    totalInterviews: {
      type: Number,
      default: 0,
    },

    averageScore: {
      type: Number,
      default: 0,
    },

    bestScore: {
      type: Number,
      default: 0,
    },

    studyStreak: {
      type: Number,
      default: 0,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Progress",
  progressSchema
);