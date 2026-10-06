const mongoose = require("mongoose");

const mockQuestionSchema = new mongoose.Schema(
  {
    // =========================
    // TEST REFERENCE
    // =========================

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockTest",
      required: [true, "Test ID is required"],
      index: true,
    },

    // =========================
    // QUESTION NUMBER
    // =========================

    questionNumber: {
      type: Number,
      required: [true, "Question number is required"],
      min: 1,
    },

    // =========================
    // QUESTION TYPE
    // =========================

    type: {
      type: String,
      required: [true, "Question type is required"],
      enum: [
        "MCQ_SINGLE",
        "MCQ_MULTIPLE",
        "TRUE_FALSE",
        "THEORY",
      ],
      index: true,
    },

    // =========================
    // QUESTION
    // =========================

    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: 5000,
    },

    // =========================
    // OPTIONS
    // =========================

    options: [
      {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    ],

    // =========================
    // CORRECT ANSWER
    // =========================

    correctAnswer: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================
    // THEORY EVALUATION
    // =========================

    evaluationCriteria: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    expectedAnswer: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // MARKS
    // =========================

    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: 0,
    },

    negativeMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // DIFFICULTY
    // =========================

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
      index: true,
    },

    // =========================
    // CATEGORY
    // =========================

    category: {
      type: String,
      trim: true,
      index: true,
    },

    // =========================
    // TOPICS
    // =========================

    topics: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================
    // TAGS
    // =========================

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================
    // EXPLANATION
    // =========================

    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    // =========================
    // QUESTION STATUS
    // =========================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// VALIDATION
// =====================================================
//
// IMPORTANT:
// Do NOT use:
//
// mockQuestionSchema.pre("validate", function(next) {})
//
// because your current Mongoose setup is throwing:
//
// TypeError: next is not a function
//
// We use synchronous validation instead.
// =====================================================

mockQuestionSchema.pre("validate", function () {
  // ========================================
  // BASIC QUESTION VALIDATION
  // ========================================

  if (!this.question || !this.question.trim()) {
    throw new Error("Question cannot be empty");
  }

  // ========================================
  // MCQ SINGLE
  // ========================================

  if (this.type === "MCQ_SINGLE") {
    if (!Array.isArray(this.options) || this.options.length < 2) {
      throw new Error(
        "MCQ_SINGLE requires at least 2 options"
      );
    }

    if (
      !Array.isArray(this.correctAnswer) ||
      this.correctAnswer.length !== 1
    ) {
      throw new Error(
        "MCQ_SINGLE must have exactly one correct answer"
      );
    }

    // Make sure correct answer exists
    // inside the available options.

    const correct = String(
      this.correctAnswer[0]
    ).trim();

    const validOption = this.options.some(
      (option) =>
        String(option).trim() === correct
    );

    if (!validOption) {
      throw new Error(
        "MCQ_SINGLE correct answer must match one of the options"
      );
    }
  }

  // ========================================
  // MCQ MULTIPLE
  // ========================================

  if (this.type === "MCQ_MULTIPLE") {
    if (!Array.isArray(this.options) || this.options.length < 2) {
      throw new Error(
        "MCQ_MULTIPLE requires at least 2 options"
      );
    }

    if (
      !Array.isArray(this.correctAnswer) ||
      this.correctAnswer.length < 2
    ) {
      throw new Error(
        "MCQ_MULTIPLE must have at least two correct answers"
      );
    }

    // Check every correct answer exists
    // inside the options.

    const optionSet = new Set(
      this.options.map((option) =>
        String(option).trim()
      )
    );

    for (const answer of this.correctAnswer) {
      if (
        !optionSet.has(
          String(answer).trim()
        )
      ) {
        throw new Error(
          "MCQ_MULTIPLE contains a correct answer that is not present in options"
        );
      }
    }
  }

  // ========================================
  // TRUE / FALSE
  // ========================================

  if (this.type === "TRUE_FALSE") {
    // Always force the options.

    this.options = [
      "true",
      "false",
    ];

    if (
      !Array.isArray(this.correctAnswer) ||
      this.correctAnswer.length !== 1
    ) {
      throw new Error(
        "TRUE_FALSE must have exactly one correct answer"
      );
    }

    const answer = String(
      this.correctAnswer[0]
    ).toLowerCase().trim();

    if (
      answer !== "true" &&
      answer !== "false"
    ) {
      throw new Error(
        "TRUE_FALSE correct answer must be either true or false"
      );
    }

    // Store normalized value.

    this.correctAnswer = [answer];
  }

  // ========================================
  // THEORY
  // ========================================

  if (this.type === "THEORY") {
    // Theory questions don't have options.

    this.options = [];

    // Theory questions don't use
    // correctAnswer.

    this.correctAnswer = [];

    // Expected answer is required.

    if (
      !this.expectedAnswer ||
      !this.expectedAnswer.trim()
    ) {
      throw new Error(
        "THEORY question requires expectedAnswer"
      );
    }

    // Evaluation criteria should exist.

    if (
      !Array.isArray(this.evaluationCriteria) ||
      this.evaluationCriteria.length === 0
    ) {
      throw new Error(
        "THEORY question requires evaluationCriteria"
      );
    }
  }

  // ========================================
  // MARK VALIDATION
  // ========================================

  if (this.marks < 0) {
    throw new Error(
      "Marks cannot be negative"
    );
  }

  if (this.negativeMarks < 0) {
    throw new Error(
      "Negative marks cannot be negative"
    );
  }
});

// ========================================
// INDEXES
// ========================================

mockQuestionSchema.index({
  testId: 1,
  questionNumber: 1,
});

mockQuestionSchema.index({
  testId: 1,
  type: 1,
});

mockQuestionSchema.index({
  testId: 1,
  difficulty: 1,
});

mockQuestionSchema.index({
  testId: 1,
  topics: 1,
});

// ========================================
// JSON SETTINGS
// ========================================

mockQuestionSchema.set("toJSON", {
  virtuals: true,
});

// ========================================
// MODEL
// ========================================

module.exports = mongoose.model(
  "MockQuestion",
  mockQuestionSchema
);