const mongoose = require("mongoose");

const loginStreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // YYYY-MM-DD in Asia/Kolkata
    loginDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Only one login record per user per calendar day
loginStreakSchema.index(
  {
    userId: 1,
    loginDate: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "LoginStreak",
  loginStreakSchema
);