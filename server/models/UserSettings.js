const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    appearance: {
      theme: {
        type: String,
        enum: ["dark", "light", "system"],
        default: "dark",
      },

      compactMode: {
        type: Boolean,
        default: false,
      },
    },

    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },

      mockTests: {
        type: Boolean,
        default: true,
      },

      mockInterviews: {
        type: Boolean,
        default: true,
      },

      resume: {
        type: Boolean,
        default: true,
      },

      notes: {
        type: Boolean,
        default: true,
      },

      resources: {
        type: Boolean,
        default: true,
      },

      habits: {
        type: Boolean,
        default: true,
      },

      placement: {
        type: Boolean,
        default: true,
      },
    },

    study: {
      dailyGoal: {
        type: Number,
        min: 15,
        max: 1440,
        default: 120,
      },

      preferredDifficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "intermediate",
      },

      reminderEnabled: {
        type: Boolean,
        default: true,
      },

      reminderTime: {
        type: String,
        default: "18:00",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "UserSettings",
  userSettingsSchema
);