const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC TEST INFORMATION
    // =========================

    title: {
      type: String,
      required: [true, "Test title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Test description is required"],
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      required: [true, "Test category is required"],
      enum: [
        "Aptitude",
        "Reasoning",
        "Java",
        "Python",
        "SQL",
        "DSA",
        "Web Development",
        "Full Stack",
        "AI/ML",
        "Computer Science",
        "Technical",
        "Other",
      ],
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      default: "Medium",
      index: true,
    },

    // =========================
    // EXAM CONFIGURATION
    // =========================

    durationMinutes: {
      type: Number,
      required: [true, "Duration is required"],
      min: 1,
      max: 300,
    },

    totalQuestions: {
      type: Number,
      required: [true, "Total questions is required"],
      min: 1,
      max: 500,
    },

    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: 1,
    },

    passingMarks: {
      type: Number,
      required: [true, "Passing marks is required"],
      min: 0,
    },

    // =========================
    // QUESTION TYPES
    // =========================

    questionTypes: [
      {
        type: String,
        enum: [
          "MCQ_SINGLE",
          "MCQ_MULTIPLE",
          "TRUE_FALSE",
          "THEORY",
        ],
      },
    ],

    // =========================
    // MARKING CONFIGURATION
    // =========================

    negativeMarking: {
      enabled: {
        type: Boolean,
        default: false,
      },

      defaultMarks: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // =========================
    // SECURITY CONFIGURATION
    // =========================

    security: {
      fullscreenRequired: {
        type: Boolean,
        default: true,
      },

      tabSwitchMonitoring: {
        type: Boolean,
        default: true,
      },

      copyPasteMonitoring: {
        type: Boolean,
        default: true,
      },

      contextMenuDisabled: {
        type: Boolean,
        default: true,
      },

      maxViolations: {
        type: Number,
        default: 5,
        min: 1,
        max: 10,
      },

      autoTerminateOnViolation: {
        type: Boolean,
        default: true,
      },
    },

    // =========================
    // AI CONFIGURATION
    // =========================

    aiEvaluation: {
      enabled: {
        type: Boolean,
        default: true,
      },

      theoryEvaluation: {
        type: Boolean,
        default: true,
      },

      generateFeedback: {
        type: Boolean,
        default: true,
      },

      generateRecommendations: {
        type: Boolean,
        default: true,
      },
    },

    // =========================
    // PUBLISHING
    // =========================

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================
    // STATISTICS
    // =========================

    statistics: {
      attempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      completedAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      averageScore: {
        type: Number,
        default: 0,
        min: 0,
      },

      averagePercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    // =========================
    // CREATOR
    // =========================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// VALIDATION
// ========================================
//
// IMPORTANT:
// Do not use next() here.
// This is synchronous validation middleware.
//

mockTestSchema.pre("validate", function () {
  if (
    this.passingMarks !== undefined &&
    this.totalMarks !== undefined &&
    this.passingMarks > this.totalMarks
  ) {
    throw new Error(
      "Passing marks cannot be greater than total marks"
    );
  }
});

// ========================================
// INDEXES
// ========================================

mockTestSchema.index({
  category: 1,
  difficulty: 1,
  isPublished: 1,
});

mockTestSchema.index({
  isPublished: 1,
  isActive: 1,
});

// ========================================
// VIRTUAL
// ========================================

mockTestSchema.virtual("durationSeconds").get(function () {
  return this.durationMinutes * 60;
});

// ========================================
// JSON SETTINGS
// ========================================

mockTestSchema.set("toJSON", {
  virtuals: true,
});

mockTestSchema.set("toObject", {
  virtuals: true,
});

// ========================================
// MODEL
// ========================================

module.exports = mongoose.model(
  "MockTest",
  mockTestSchema
);