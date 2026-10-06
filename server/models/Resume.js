const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      default: 0,
    },

    skills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    analysis: {
      type: String,
      default: "",
    },

    keywordRelevance: {
      type: Number,
      default: 0,
    },

    formattingScore: {
      type: Number,
      default: 0,
    },

    impactScore: {
      type: Number,
      default: 0,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendedRoles: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({
  userId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Resume",
  resumeSchema
);