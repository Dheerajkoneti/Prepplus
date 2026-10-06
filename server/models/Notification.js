const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "SYSTEM",
        "MOCK_TEST",
        "MOCK_INTERVIEW",
        "RESUME",
        "NOTES",
        "RESOURCE",
        "HABIT",
        "PLACEMENT",
        "AI_CHAT",
        "ACCOUNT",
        "GENERAL",
      ],
      default: "GENERAL",
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    icon: {
      type: String,
      default: "🔔",
    },

    link: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  userId: 1,
  createdAt: -1,
});

notificationSchema.index({
  userId: 1,
  isRead: 1,
});

notificationSchema.index({
  userId: 1,
  type: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);