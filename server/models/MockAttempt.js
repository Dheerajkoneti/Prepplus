const mongoose = require("mongoose");

// ========================================
// ANSWER SCHEMA
// ========================================

const attemptAnswerSchema = new mongoose.Schema(
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

    questionType: {
      type: String,
      enum: [
        "MCQ_SINGLE",
        "MCQ_MULTIPLE",
        "TRUE_FALSE",
        "THEORY",
      ],
      required: true,
    },

    // User's answer.
    //
    // Examples:
    //
    // MCQ:
    // ["extends"]
    //
    // Multiple:
    // ["public", "private"]
    //
    // Theory:
    // ["Encapsulation is..."]
    //

    answer: {
      type: [String],
      default: [],
    },

    answered: {
      type: Boolean,
      default: false,
    },

    markedForReview: {
      type: Boolean,
      default: false,
    },

    visited: {
      type: Boolean,
      default: false,
    },

    // ====================================
    // OBJECTIVE EVALUATION
    // ====================================

    isCorrect: {
      type: Boolean,
      default: false,
    },

    marksAwarded: {
      type: Number,
      default: 0,
    },

    // ====================================
    // AI THEORY EVALUATION
    // ====================================

    evaluationStatus: {
      type: String,
      enum: [
        "NOT_REQUIRED",
        "PENDING",
        "EVALUATING",
        "COMPLETED",
        "FAILED",
      ],
      default: "NOT_REQUIRED",
    },

    aiScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    aiMaxScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    aiFeedback: {
      type: String,
      default: "",
    },

    aiStrengths: [
      {
        type: String,
      },
    ],

    aiImprovements: [
      {
        type: String,
      },
    ],

    evaluatedAt: {
      type: Date,
      default: null,
    },

    // ====================================
    // TIMESTAMPS
    // ====================================

    answeredAt: {
      type: Date,
      default: null,
    },

    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

// ========================================
// SECURITY EVENT SCHEMA
// ========================================

const securityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "TAB_SWITCH",
        "FULLSCREEN_EXIT",
        "COPY_ATTEMPT",
        "PASTE_ATTEMPT",
        "CONTEXT_MENU",
        "WINDOW_BLUR",
        "CAMERA_DISCONNECTED",
        "MICROPHONE_DISCONNECTED",
        "FACE_NOT_DETECTED",
        "MULTIPLE_FACE_DETECTED",
      ],
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    countedAsViolation: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: true,
  }
);

// ========================================
// MAIN ATTEMPT SCHEMA
// ========================================

const mockAttemptSchema = new mongoose.Schema(
  {
    // =========================
    // USER
    // =========================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // =========================
    // TEST
    // =========================

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: [true, "Test ID is required"],
      index: true,
    },

    // =========================
    // STATUS
    // =========================

    status: {
      type: String,
      enum: [
        "NOT_STARTED",
        "IN_PROGRESS",
        "EVALUATING",
        "COMPLETED",
        "TERMINATED",
        "EXPIRED",
        "ABANDONED",
      ],
      default: "NOT_STARTED",
      index: true,
    },

    // =========================
    // TIME
    // =========================

    startedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    terminatedAt: {
      type: Date,
      default: null,
    },

    timeTakenSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // CURRENT POSITION
    // =========================

    currentQuestionIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // ANSWERS
    // =========================

    answers: {
      type: [attemptAnswerSchema],
      default: [],
    },

    // =========================
    // PROGRESS
    // =========================

    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    answeredQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    unansweredQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    markedQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // SECURITY
    // =========================

    security: {
      violationCount: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },

      maxViolations: {
        type: Number,
        default: 3,
        min: 1,
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
        min: 0,
      },

      fullscreenExits: {
        type: Number,
        default: 0,
        min: 0,
      },

      copyAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      pasteAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      contextMenuAttempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      cameraDisconnects: {
        type: Number,
        default: 0,
        min: 0,
      },

      microphoneDisconnects: {
        type: Number,
        default: 0,
        min: 0,
      },

      faceWarnings: {
        type: Number,
        default: 0,
        min: 0,
      },

      multipleFaceWarnings: {
        type: Number,
        default: 0,
        min: 0,
      },

      lastEventAt: {
        type: Date,
        default: null,
      },

      lastEventType: {
        type: String,
        default: "",
      },

      events: {
        type: [securityEventSchema],
        default: [],
      },
    },

    // =========================
    // HEARTBEAT
    // =========================

    lastHeartbeat: {
      type: Date,
      default: null,
    },

    heartbeatCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // NETWORK
    // =========================

    lastClientSaveAt: {
      type: Date,
      default: null,
    },

    lastServerSyncAt: {
      type: Date,
      default: null,
    },

    // =========================
    // RESULT REFERENCE
    // =========================

    resultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockResult",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// INDEXES
// ========================================

mockAttemptSchema.index({
  userId: 1,
  testId: 1,
});

mockAttemptSchema.index({
  userId: 1,
  status: 1,
});

mockAttemptSchema.index({
  expiresAt: 1,
  status: 1,
});

mockAttemptSchema.index({
  testId: 1,
  status: 1,
});

// ========================================
// VIRTUAL
// ========================================

mockAttemptSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) {
    return false;
  }

  return new Date() >= this.expiresAt;
});

mockAttemptSchema.virtual("remainingSeconds").get(function () {
  if (!this.expiresAt) {
    return 0;
  }

  const remaining =
    this.expiresAt.getTime() - Date.now();

  return Math.max(
    0,
    Math.floor(remaining / 1000)
  );
});

// ========================================
// JSON SETTINGS
// ========================================

mockAttemptSchema.set("toJSON", {
  virtuals: true,
});

mockAttemptSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model(
  "MockAttempt",
  mockAttemptSchema
);