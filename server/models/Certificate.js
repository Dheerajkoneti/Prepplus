const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    certificateUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);


// Useful for finding a user's certificate
certificateSchema.index({
  userId: 1,
  courseId: 1,
});


// IMPORTANT:
// Export the actual Mongoose model
module.exports = mongoose.model(
  "Certificate",
  certificateSchema
);