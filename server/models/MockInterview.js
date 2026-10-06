const mongoose = require("mongoose");

// ======================================================
// ANSWER SCHEMA
// ======================================================

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    questionIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    answer: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    maxScore: {
      type: Number,
      default: 10,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    expectedAnswer: {
      type: String,
      default: "",
    },

    whatWasGood: {
      type: String,
      default: "",
    },

    whatWasWrong: {
      type: String,
      default: "",
    },

    improvement: {
      type: String,
      default: "",
    },

    feedback: {
      type: String,
      default: "",
    },

    evaluationStatus: {
      type: String,
      enum: [
        "pending",
        "evaluating",
        "completed",
        "failed",
      ],
      default: "pending",
    },

    answeredAt: {
      type: Date,
    },

    evaluatedAt: {
      type: Date,
    },
  },
  {
    _id: true,
  }
);

// ======================================================
// SECURITY EVENT
// ======================================================

const securityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "TAB_SWITCH",
        "WINDOW_BLUR",
        "FULLSCREEN_EXIT",
        "FACE_NOT_DETECTED",
        "MULTIPLE_FACE_DETECTED",
        "CAMERA_DISCONNECTED",
        "MICROPHONE_DISCONNECTED",
        "COPY_ATTEMPT",
        "PASTE_ATTEMPT",
        "CONTEXT_MENU",
        "OTHER",
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

    // Whether this event consumed a strike.
    countedAsViolation: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

// ======================================================
// MAIN MOCK INTERVIEW
// ======================================================

const mockInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==================================================
    // CONFIG
    // ==================================================

    role: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      default: "",
    },

    level: {
      type: String,
      default: "Fresher",
    },

    difficulty: {
      type: String,
      default: "Intermediate",
    },

    duration: {
      type: String,
      default: "30 Mins",
    },

    language: {
      type: String,
      default: "English",
    },

    interviewType: {
      type: String,
      default: "Technical",
    },

    // ==================================================
    // QUESTIONS
    // ==================================================

    questions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    // ==================================================
    // ANSWERS
    // ==================================================

    answers: {
      type: [answerSchema],
      default: [],
    },

    attemptedQuestions: {
      type: Number,
      default: 0,
    },

    // ==================================================
    // SCORES
    // ==================================================

    overallScore: {
      type: Number,
      default: 0,
    },

    technicalScore: {
      type: Number,
      default: 0,
    },

    communicationScore: {
      type: Number,
      default: 0,
    },

    confidenceScore: {
      type: Number,
      default: 0,
    },

    // ==================================================
    // REPORT
    // ==================================================

    feedback: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    reportGenerated: {
      type: Boolean,
      default: false,
    },

    // ==================================================
    // SECURITY
    // ==================================================

    security: {
      violationCount: {
        type: Number,
        default: 0,
        min: 0,
        max: 3,
      },

      status: {
        type: String,
        enum: [
          "Secure",
          "Warning",
          "Terminated",
        ],
        default: "Secure",
      },

      events: {
        type: [securityEventSchema],
        default: [],
      },

      tabSwitches: {
        type: Number,
        default: 0,
      },

      fullscreenExits: {
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

      cameraDisconnects: {
        type: Number,
        default: 0,
      },

      microphoneDisconnects: {
        type: Number,
        default: 0,
      },

      copyPasteAttempts: {
        type: Number,
        default: 0,
      },

      // Server-side cooldown support.
      lastEventAt: {
        type: Date,
        default: null,
      },

      lastEventType: {
        type: String,
        default: null,
      },
    },

    // ==================================================
    // STATUS
    // ==================================================

    status: {
      type: String,
      enum: [
        "Started",
        "In Progress",
        "Completed",
        "Terminated",
      ],
      default: "Started",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MockInterview",
  mockInterviewSchema
);