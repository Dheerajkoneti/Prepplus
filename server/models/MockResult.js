const mongoose = require("mongoose");

// ========================================
// QUESTION RESULT
// ========================================

const questionResultSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockQuestion",
      required: true,
    },

    questionNumber: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "MCQ_SINGLE",
        "MCQ_MULTIPLE",
        "TRUE_FALSE",
        "THEORY",
      ],
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    // User's submitted answer
    userAnswer: {
      type: [String],
      default: [],
    },

    // Correct answer.
    //
    // This is safe in the RESULT because
    // the exam is already finished.
    //

    correctAnswer: {
      type: [String],
      default: [],
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    marks: {
      type: Number,
      default: 0,
    },

    marksAwarded: {
      type: Number,
      default: 0,
    },

    negativeMarks: {
      type: Number,
      default: 0,
    },

    // ====================================
    // THEORY / AI
    // ====================================

    aiEvaluation: {
      enabled: {
        type: Boolean,
        default: false,
      },

      score: {
        type: Number,
        default: 0,
      },

      maxScore: {
        type: Number,
        default: 0,
      },

      feedback: {
        type: String,
        default: "",
      },

      strengths: [
        {
          type: String,
        },
      ],

      improvements: [
        {
          type: String,
        },
      ],

      status: {
        type: String,
        enum: [
          "NOT_REQUIRED",
          "PENDING",
          "COMPLETED",
          "FAILED",
        ],
        default: "NOT_REQUIRED",
      },
    },

    explanation: {
      type: String,
      default: "",
    },

    topic: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

// ========================================
// MAIN RESULT SCHEMA
// ========================================

const mockResultSchema = new mongoose.Schema(
  {
    // =========================
    // REFERENCES
    // =========================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: true,
      index: true,
    },

    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockAttempt",
      required: true,
      unique: true,
      index: true,
    },

    // =========================
    // TEST INFORMATION
    // =========================

    testTitle: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      default: "",
    },

    // =========================
    // SCORE
    // =========================

    totalMarks: {
      type: Number,
      default: 0,
    },

    obtainedMarks: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    passingMarks: {
      type: Number,
      default: 0,
    },

    passed: {
      type: Boolean,
      default: false,
    },

    // =========================
    // QUESTION STATISTICS
    // =========================

    totalQuestions: {
      type: Number,
      default: 0,
    },

    answeredQuestions: {
      type: Number,
      default: 0,
    },

    unansweredQuestions: {
      type: Number,
      default: 0,
    },

    correctAnswers: {
      type: Number,
      default: 0,
    },

    wrongAnswers: {
      type: Number,
      default: 0,
    },

    // =========================
    // TYPE-WISE SCORES
    // =========================

    mcqScore: {
      type: Number,
      default: 0,
    },

    mcqMaxScore: {
      type: Number,
      default: 0,
    },

    theoryScore: {
      type: Number,
      default: 0,
    },

    theoryMaxScore: {
      type: Number,
      default: 0,
    },

    // =========================
    // TIME
    // =========================

    durationSeconds: {
      type: Number,
      default: 0,
    },

    timeTakenSeconds: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // QUESTION RESULTS
    // =========================

    questions: {
      type: [questionResultSchema],
      default: [],
    },

    // =========================
    // CATEGORY PERFORMANCE
    // =========================

    categoryPerformance: [
      {
        category: {
          type: String,
          required: true,
        },

        totalQuestions: {
          type: Number,
          default: 0,
        },

        correct: {
          type: Number,
          default: 0,
        },

        wrong: {
          type: Number,
          default: 0,
        },

        unanswered: {
          type: Number,
          default: 0,
        },

        score: {
          type: Number,
          default: 0,
        },

        maxScore: {
          type: Number,
          default: 0,
        },

        percentage: {
          type: Number,
          default: 0,
        },
      },
    ],

    // =========================
    // TOPIC PERFORMANCE
    // =========================

    topicPerformance: [
      {
        topic: {
          type: String,
          required: true,
        },

        questions: {
          type: Number,
          default: 0,
        },

        correct: {
          type: Number,
          default: 0,
        },

        score: {
          type: Number,
          default: 0,
        },

        maxScore: {
          type: Number,
          default: 0,
        },

        percentage: {
          type: Number,
          default: 0,
        },
      },
    ],

    // =========================
    // AI REPORT
    // =========================

    aiReport: {
      enabled: {
        type: Boolean,
        default: false,
      },

      summary: {
        type: String,
        default: "",
      },

      strengths: [
        {
          type: String,
        },
      ],

      weaknesses: [
        {
          type: String,
        },
      ],

      recommendations: [
        {
          type: String,
        },
      ],

      overallFeedback: {
        type: String,
        default: "",
      },

      generatedAt: {
        type: Date,
        default: null,
      },
    },

    // =========================
    // SECURITY SUMMARY
    // =========================

    security: {
      violationCount: {
        type: Number,
        default: 0,
      },

      status: {
        type: String,
        enum: [
          "SECURE",
          "WARNING",
          "FINAL_WARNING",
          "TERMINATED",
        ],
        default: "SECURE",
      },

      tabSwitches: {
        type: Number,
        default: 0,
      },

      fullscreenExits: {
        type: Number,
        default: 0,
      },

      copyAttempts: {
        type: Number,
        default: 0,
      },

      pasteAttempts: {
        type: Number,
        default: 0,
      },

      contextMenuAttempts: {
        type: Number,
        default: 0,
      },

      cameraDisconnects: {
        type: Number,
        default: 0,
      },

      microphoneDisconnects: {
        type: Number,
        default: 0,
      },

      faceWarnings: {
        type: Number,
        default: 0,
      },

      multipleFaceWarnings: {
        type: Number,
        default: 0,
      },
    },

    // =========================
    // RESULT STATUS
    // =========================

    status: {
      type: String,
      enum: [
        "GENERATING",
        "COMPLETED",
        "PARTIAL",
        "FAILED",
      ],
      default: "GENERATING",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// INDEXES
// ========================================

mockResultSchema.index({
  userId: 1,
  createdAt: -1,
});

mockResultSchema.index({
  testId: 1,
  createdAt: -1,
});

mockResultSchema.index({
  userId: 1,
  testId: 1,
});

// ========================================
// JSON SETTINGS
// ========================================

mockResultSchema.set("toJSON", {
  virtuals: true,
});

mockResultSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model(
  "MockResult",
  mockResultSchema
);