const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Full Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email Address
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Phone Number
    phone: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },

    // Password
    password: {
      type: String,
      default: "",
    },

    // Google OAuth ID
    googleId: {
      type: String,
      default: "",
    },

    // Profile Image
    profilePicture: {
      type: String,
      default: "",
    },

    // Email Verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // OTP Code
    emailOTP: {
      type: String,
      default: "",
    },

    // OTP Expiry
    otpExpire: {
      type: Date,
      default: null,
    },

    // User Role
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    // Password Reset
    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },

    // Login Method
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // Last Login
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);