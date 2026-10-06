const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },

    icon: {
      type: String,
      default: "check",
      trim: true,
    },

    color: {
      type: String,
      default: "#8b5cf6",
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Study",
        "Coding",
        "Fitness",
        "Health",
        "Career",
        "Personal",
        "Productivity",
        "Other",
      ],
      default: "Productivity",
    },

    frequency: {
      type: String,
      enum: [
        "daily",
        "weekdays",
        "custom",
      ],
      default: "daily",
    },

    targetDays: {
      type: [Number],
      default: [],
    },

    reminderTime: {
      type: String,
      default: "",
    },

    startDate: {
      type: String,
      required: true,
    },

    completedDates: {
      type: [String],
      default: [],
    },

    archived: {
      type: Boolean,
      default: false,
    },

    archivedAt: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

habitSchema.index({
  userId: 1,
  archived: 1,
});

module.exports = mongoose.model(
  "Habit",
  habitSchema
);