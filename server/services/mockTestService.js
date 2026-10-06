const mongoose = require("mongoose");

const MockTest = require("../models/MockTest");
const MockQuestion = require("../models/MockQuestion");
const MockAttempt = require("../models/MockAttempt");
const MockResult = require("../models/MockResult");

const {
  generateMockTestQuestions,
} = require("./geminiService");

const VALID_QUESTION_TYPES = [
  "MCQ_SINGLE",
  "MCQ_MULTIPLE",
  "TRUE_FALSE",
  "THEORY",
];

const ACTIVE_ATTEMPT_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
];

const CLOSED_ATTEMPT_STATUSES = [
  "COMPLETED",
  "TERMINATED",
  "EXPIRED",
  "ABANDONED",
];

const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeMongoId = (value) => {
  if (!value) return null;

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value._id) {
    return normalizeMongoId(value._id);
  }

  if (value.id) {
    return normalizeMongoId(value.id);
  }

  return null;
};

const shuffleArray = (array = []) => {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

const normalizeAnswer = (answer) => {
  if (answer === undefined || answer === null) {
    return [];
  }

  if (Array.isArray(answer)) {
    return answer
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return [String(answer).trim()].filter(Boolean);
};

const getPublishedTests = async ({
  category,
  difficulty,
} = {}) => {
  const filter = {
    isPublished: true,
    isActive: true,
  };

  if (category) {
    filter.category = category;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  return MockTest.find(filter)
    .sort({ createdAt: -1 })
    .lean();
};

const getTestById = async (testId) => {
  if (!isValidObjectId(testId)) {
    throw new Error("Invalid test ID.");
  }

  const test = await MockTest.findOne({
    _id: testId,
    isActive: true,
  }).lean();

  if (!test) {
    throw new Error("Mock test not found.");
  }

  return test;
};

const getQuestionsForTest = async (testId) => {
  if (!isValidObjectId(testId)) {
    throw new Error("Invalid test ID.");
  }

  return MockQuestion.find({
    testId,
    isActive: true,
  })
    .sort({ questionNumber: 1 })
    .lean();
};

const sanitizeQuestion = (question) => {
  if (!question) return null;

  const safeQuestion = {
    ...question,
  };

  delete safeQuestion.correctAnswer;
  delete safeQuestion.expectedAnswer;
  delete safeQuestion.evaluationCriteria;

  return safeQuestion;
};

const getSafeQuestionsForTest = async (testId) => {
  const questions = await getQuestionsForTest(testId);

  return questions.map(sanitizeQuestion);
};

const findActiveAttempt = async (
  userId,
  testId
) => {
  return MockAttempt.findOne({
    userId,
    testId,
    status: {
      $in: ACTIVE_ATTEMPT_STATUSES,
    },
  });
};

const checkAndUpdateExpiry = async (attempt) => {
  if (!attempt) return null;

  if (
    attempt.status === "IN_PROGRESS" &&
    attempt.expiresAt &&
    new Date() >= new Date(attempt.expiresAt)
  ) {
    attempt.status = "EXPIRED";

    attempt.submittedAt =
      attempt.submittedAt || new Date();

    attempt.timeTakenSeconds =
      attempt.startedAt
        ? Math.max(
            0,
            Math.floor(
              (new Date() -
                new Date(attempt.startedAt)) /
                1000
            )
          )
        : 0;

    await attempt.save();
  }

  return attempt;
};

const getRemainingSeconds = (attempt) => {
  if (!attempt || !attempt.expiresAt) {
    return 0;
  }

  if (
    CLOSED_ATTEMPT_STATUSES.includes(
      attempt.status
    )
  ) {
    return 0;
  }

  const remaining = Math.floor(
    (new Date(attempt.expiresAt) -
      new Date()) /
      1000
  );

  return Math.max(0, remaining);
};

const buildAttemptResponse = async (attempt) => {
  await checkAndUpdateExpiry(attempt);

  const questionIds = Array.isArray(
    attempt.answers
  )
    ? attempt.answers
        .map((answer) => answer.questionId)
        .filter(Boolean)
    : [];

  const questions = await MockQuestion.find({
    _id: {
      $in: questionIds,
    },
    isActive: true,
  }).lean();

  const questionMap = new Map();

  questions.forEach((question) => {
    questionMap.set(
      String(question._id),
      sanitizeQuestion(question)
    );
  });

  const orderedQuestions = (
    attempt.answers || []
  )
    .map((answer) => {
      const question = questionMap.get(
        String(answer.questionId)
      );

      if (!question) return null;

      return {
        ...question,
        answerState: {
          answer: Array.isArray(answer.answer)
            ? answer.answer
            : normalizeAnswer(answer.answer),
          answered: Boolean(answer.answered),
          markedForReview: Boolean(
            answer.markedForReview
          ),
          visited: Boolean(answer.visited),
        },
      };
    })
    .filter(Boolean);

  return {
    _id: attempt._id,
    id: attempt._id,
    userId: attempt.userId,
    testId: attempt.testId,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    submittedAt: attempt.submittedAt,
    currentQuestionIndex:
      attempt.currentQuestionIndex,
    totalQuestions: attempt.totalQuestions,
    answeredQuestions:
      attempt.answeredQuestions,
    unansweredQuestions:
      attempt.unansweredQuestions,
    markedQuestions:
      attempt.markedQuestions,
    remainingSeconds:
      getRemainingSeconds(attempt),
    security: attempt.security,
    questions: orderedQuestions,
  };
};

const getAttemptDocument = async (
  userId,
  attemptId
) => {
  if (!isValidObjectId(attemptId)) {
    throw new Error("Invalid attempt ID.");
  }

  const attempt = await MockAttempt.findOne({
    _id: attemptId,
    userId,
  });

  if (!attempt) {
    throw new Error("Attempt not found.");
  }

  return attempt;
};

const startTest = async (
  userId,
  testId
) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!isValidObjectId(testId)) {
    throw new Error("Invalid test ID.");
  }

  const test = await MockTest.findOne({
    _id: testId,
    isPublished: true,
    isActive: true,
  });

  if (!test) {
    throw new Error(
      "Mock test not found or unavailable."
    );
  }

  let attempt = await findActiveAttempt(
    userId,
    testId
  );

  if (attempt) {
    await checkAndUpdateExpiry(attempt);

    if (
      CLOSED_ATTEMPT_STATUSES.includes(
        attempt.status
      )
    ) {
      attempt = null;
    }
  }

  if (!attempt) {
    let questions = await MockQuestion.find({
      testId,
      isActive: true,
    })
      .sort({
        questionNumber: 1,
      })
      .lean();

    if (
      questions.length <
      test.totalQuestions
    ) {
      throw new Error(
        `Test has only ${questions.length} questions but requires ${test.totalQuestions}.`
      );
    }

    questions = questions.slice(
      0,
      test.totalQuestions
    );

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() +
        test.durationMinutes *
          60 *
          1000
    );

    attempt = new MockAttempt({
      userId,
      testId,
      status: "IN_PROGRESS",
      startedAt: now,
      expiresAt,
      totalQuestions: questions.length,
      currentQuestionIndex: 0,
      answeredQuestions: 0,
      unansweredQuestions:
        questions.length,
      markedQuestions: 0,
      answers: questions.map((question) => ({
        questionId: question._id,
        questionNumber:
          question.questionNumber,
        questionType: question.type,
        answer: [],
        answered: false,
        markedForReview: false,
        visited: false,
        evaluationStatus:
          question.type === "THEORY"
            ? "PENDING"
            : "NOT_REQUIRED",
      })),
      security: {
        violationCount: 0,
        maxViolations:
          test.security?.maxViolations || 3,
        status: "SECURE",
        events: [],
      },
    });

    if (
      attempt.answers &&
      attempt.answers.length > 0
    ) {
      attempt.answers[0].visited = true;
    }

    await attempt.save();

    await MockTest.updateOne(
      {
        _id: testId,
      },
      {
        $inc: {
          "statistics.attempts": 1,
        },
      }
    );
  }

  return buildAttemptResponse(attempt);
};

const getAttempt = async (
  userId,
  attemptId
) => {
  const attempt =
    await getAttemptDocument(
      userId,
      attemptId
    );

  return buildAttemptResponse(attempt);
};

const validateActiveAttempt = async (
  userId,
  attemptId
) => {
  const attempt =
    await getAttemptDocument(
      userId,
      attemptId
    );

  await checkAndUpdateExpiry(attempt);

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error(
      `Attempt is ${String(
        attempt.status
      ).toLowerCase()}.`
    );
  }

  if (
    getRemainingSeconds(attempt) <= 0
  ) {
    attempt.status = "EXPIRED";
    attempt.submittedAt =
      attempt.submittedAt || new Date();
    await attempt.save();

    throw new Error("Test has expired.");
  }

  return attempt;
};

const findAttemptAnswer = (
  attempt,
  questionId
) => {
  if (
    !attempt ||
    !Array.isArray(attempt.answers)
  ) {
    return null;
  }

  const normalizedQuestionId =
    normalizeMongoId(questionId);

  if (!normalizedQuestionId) {
    return null;
  }

  return (
    attempt.answers.find(
      (answerRecord) =>
        normalizeMongoId(
          answerRecord.questionId
        ) === normalizedQuestionId
    ) || null
  );
};

const resolveQuestionForAttempt =
  async (
    attempt,
    questionIdentifier
  ) => {
    if (
      !attempt ||
      !Array.isArray(attempt.answers)
    ) {
      return null;
    }

    const possibleId =
      normalizeMongoId(
        questionIdentifier
      );

    if (
      possibleId &&
      isValidObjectId(possibleId)
    ) {
      const answerRecord =
        findAttemptAnswer(
          attempt,
          possibleId
        );

      if (answerRecord) {
        return {
          questionId: possibleId,
          answerRecord,
        };
      }
    }

    const questionNumber =
      Number(questionIdentifier);

    if (
      Number.isInteger(questionNumber) &&
      questionNumber > 0
    ) {
      const answerRecord =
        attempt.answers.find(
          (item) =>
            Number(
              item.questionNumber
            ) === questionNumber
        );

      if (answerRecord) {
        return {
          questionId:
            normalizeMongoId(
              answerRecord.questionId
            ),
          answerRecord,
        };
      }
    }

    return null;
  };

const recalculateAttemptProgress =
  async (attempt) => {
    const answers = Array.isArray(
      attempt.answers
    )
      ? attempt.answers
      : [];

    attempt.answeredQuestions =
      answers.filter((answer) => {
        if (
          answer.answered === true
        ) {
          return true;
        }

        const normalized =
          normalizeAnswer(
            answer.answer
          );

        return normalized.length > 0;
      }).length;

    attempt.unansweredQuestions =
      Math.max(
        0,
        answers.length -
          attempt.answeredQuestions
      );

    attempt.markedQuestions =
      answers.filter(
        (answer) =>
          Boolean(
            answer.markedForReview
          )
      ).length;

    return attempt;
  };

const saveAnswer = async (
  userId,
  attemptId,
  questionId,
  answer,
  options = {}
) => {
  if (!userId) {
    throw new Error(
      "User authentication required."
    );
  }

  if (!attemptId) {
    throw new Error(
      "Attempt ID is required."
    );
  }

  if (!questionId) {
    throw new Error(
      "Question ID is required."
    );
  }

  const attempt =
    await MockAttempt.findOne({
      _id: attemptId,
      userId,
    }).lean();

  if (!attempt) {
    throw new Error(
      "Attempt not found or you do not have access to this attempt."
    );
  }

  if (
    !ACTIVE_ATTEMPT_STATUSES.includes(
      attempt.status
    )
  ) {
    throw new Error(
      `Cannot save answer because attempt status is ${attempt.status}.`
    );
  }

  if (
    attempt.expiresAt &&
    new Date(attempt.expiresAt).getTime() <=
      Date.now()
  ) {
    await MockAttempt.updateOne(
      {
        _id: attemptId,
        userId,
      },
      {
        $set: {
          status: "EXPIRED",
          submittedAt: new Date(),
        },
      }
    );

    throw new Error(
      "This test has expired."
    );
  }

  const questionExists =
    Array.isArray(attempt.answers) &&
    attempt.answers.some(
      (item) =>
        String(item.questionId) ===
        String(questionId)
    );

  if (!questionExists) {
    throw new Error(
      "Question does not belong to this attempt."
    );
  }

  const normalizedAnswer =
    normalizeAnswer(answer);

  const now = new Date();

  let currentQuestionIndex =
    options.currentQuestionIndex;

  if (
    currentQuestionIndex !==
      undefined &&
    currentQuestionIndex !== null
  ) {
    currentQuestionIndex = Number(
      currentQuestionIndex
    );
  }

  const update = {
    $set: {
      "answers.$.answer":
        normalizedAnswer,
      "answers.$.answered":
        normalizedAnswer.length > 0,
      "answers.$.answeredAt":
        normalizedAnswer.length > 0
          ? now
          : null,
      "answers.$.lastSavedAt":
        now,
      lastClientSaveAt: now,
      lastServerSyncAt: now,
    },
  };

  if (
    Number.isInteger(
      currentQuestionIndex
    ) &&
    currentQuestionIndex >= 0 &&
    currentQuestionIndex <
      attempt.answers.length
  ) {
    update.$set.currentQuestionIndex =
      currentQuestionIndex;
  }

  if (
    options.markedForReview !==
    undefined
  ) {
    update.$set[
      "answers.$.markedForReview"
    ] = Boolean(
      options.markedForReview
    );
  }

  if (
    Number.isInteger(
      currentQuestionIndex
    ) &&
    currentQuestionIndex >= 0 &&
    currentQuestionIndex <
      attempt.answers.length
  ) {
    update.$set[
      `answers.${currentQuestionIndex}.visited`
    ] = true;
  }

  const updatedAttempt =
    await MockAttempt.findOneAndUpdate(
      {
        _id: attemptId,
        userId,
        "answers.questionId":
          questionId,
      },
      update,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

  if (!updatedAttempt) {
    throw new Error(
      "Unable to save answer. Attempt or question was not found."
    );
  }

  const answers =
    updatedAttempt.answers || [];

  const answeredCount =
    answers.filter((item) => {
      if (item.answered === true) {
        return true;
      }

      return normalizeAnswer(
        item.answer
      ).length > 0;
    }).length;

  const totalQuestions =
    answers.length;

  const markedCount =
    answers.filter(
      (item) =>
        Boolean(
          item.markedForReview
        )
    ).length;

  const unansweredCount =
    Math.max(
      0,
      totalQuestions -
        answeredCount
    );

  await MockAttempt.updateOne(
    {
      _id: attemptId,
      userId,
    },
    {
      $set: {
        answeredQuestions:
          answeredCount,
        unansweredQuestions:
          unansweredCount,
        markedQuestions:
          markedCount,
        lastServerSyncAt: now,
      },
    }
  );

  return {
    success: true,
    attemptId,
    questionId,
    answer: normalizedAnswer,
    progress: {
      answered:
        answeredCount,
      unanswered:
        unansweredCount,
      marked:
        markedCount,
      total:
        totalQuestions,
      percentage:
        totalQuestions > 0
          ? Math.round(
              (answeredCount /
                totalQuestions) *
                100
            )
          : 0,
    },
    savedAt: now,
  };
};

const markQuestionForReview =
  async (
    userId,
    attemptId,
    questionId,
    marked
  ) => {
    const attempt =
      await validateActiveAttempt(
        userId,
        attemptId
      );

    const resolved =
      await resolveQuestionForAttempt(
        attempt,
        questionId
      );

    if (!resolved) {
      throw new Error(
        "Question does not belong to this attempt."
      );
    }

    resolved.answerRecord.markedForReview =
      Boolean(marked);

    resolved.answerRecord.visited =
      true;

    await recalculateAttemptProgress(
      attempt
    );

    await attempt.save();

    return {
      success: true,
      questionId:
        resolved.questionId,
      markedForReview:
        resolved.answerRecord
          .markedForReview,
      markedQuestions:
        attempt.markedQuestions,
    };
  };

const updateCurrentQuestion =
  async (
    userId,
    attemptId,
    questionIndex
  ) => {
    const attempt =
      await validateActiveAttempt(
        userId,
        attemptId
      );

    const index =
      Number(questionIndex);

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >=
        attempt.answers.length
    ) {
      throw new Error(
        "Invalid question index."
      );
    }

    attempt.currentQuestionIndex =
      index;

    attempt.answers[index].visited =
      true;

    await attempt.save();

    return {
      success: true,
      currentQuestionIndex:
        attempt.currentQuestionIndex,
    };
  };

const heartbeat = async (
  userId,
  attemptId,
  data = {}
) => {
  const attempt =
    await getAttemptDocument(
      userId,
      attemptId
    );

  await checkAndUpdateExpiry(attempt);

  if (
    attempt.status === "IN_PROGRESS"
  ) {
    if (
      data.currentQuestionIndex !==
      undefined
    ) {
      const index = Number(
        data.currentQuestionIndex
      );

      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index <
          attempt.answers.length
      ) {
        attempt.currentQuestionIndex =
          index;

        attempt.answers[index].visited =
          true;
      }
    }

    attempt.lastHeartbeat =
      new Date();

    attempt.heartbeatCount =
      (attempt.heartbeatCount || 0) + 1;

    attempt.lastServerSyncAt =
      new Date();

    await attempt.save();
  }

  return {
    success: true,
    status: attempt.status,
    remainingSeconds:
      getRemainingSeconds(attempt),
    currentQuestionIndex:
      attempt.currentQuestionIndex,
    security: attempt.security,
  };
};

const getAttemptProgress =
  async (
    userId,
    attemptId
  ) => {
    const attempt =
      await getAttemptDocument(
        userId,
        attemptId
      );

    await checkAndUpdateExpiry(attempt);

    return {
      success: true,
      status: attempt.status,
      totalQuestions:
        attempt.totalQuestions,
      answeredQuestions:
        attempt.answeredQuestions,
      unansweredQuestions:
        attempt.unansweredQuestions,
      markedQuestions:
        attempt.markedQuestions,
      currentQuestionIndex:
        attempt.currentQuestionIndex,
      remainingSeconds:
        getRemainingSeconds(attempt),
    };
  };

const getUserAttempts = async (userId) => {
  const attempts = await MockAttempt.find({
    userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!attempts.length) {
    return [];
  }

  const attemptIds = attempts.map(
    (attempt) => attempt._id
  );

  const results = await MockResult.find({
    attemptId: {
      $in: attemptIds,
    },
  }).lean();

  const resultMap = new Map();

  results.forEach((result) => {
    resultMap.set(
      String(result.attemptId),
      result
    );
  });

  return attempts.map((attempt) => {
    const result = resultMap.get(
      String(attempt._id)
    );

    return {
      ...attempt,

      resultId:
        result?._id ||
        attempt.resultId ||
        null,

      result: result || null,

      testTitle:
        result?.testTitle ||
        attempt?.test?.title ||
        attempt?.testTitle ||
        "Mock Test",

      category:
        result?.category ||
        attempt?.test?.category ||
        attempt?.category ||
        "General",

      difficulty:
        result?.difficulty ||
        attempt?.test?.difficulty ||
        attempt?.difficulty ||
        "Mixed",

      obtainedMarks:
        result?.obtainedMarks ?? 0,

      totalMarks:
        result?.totalMarks ??
        attempt?.test?.totalMarks ??
        0,

      percentage:
        result?.percentage ?? 0,

      passed:
        result?.passed === true,

      totalQuestions:
        result?.totalQuestions ??
        attempt?.progress?.totalQuestions ??
        attempt?.answers?.length ??
        0,

      answeredQuestions:
        result?.answeredQuestions ??
        attempt?.progress?.answeredQuestions ??
        0,

      unansweredQuestions:
        result?.unansweredQuestions ??
        attempt?.progress?.unansweredQuestions ??
        0,

      timeTakenSeconds:
        result?.timeTakenSeconds ??
        attempt?.timeTakenSeconds ??
        0,

      submittedAt:
        result?.submittedAt ??
        attempt?.submittedAt ??
        null,
    };
  });
};
const abandonAttempt =
  async (
    userId,
    attemptId
  ) => {
    const attempt =
      await getAttemptDocument(
        userId,
        attemptId
      );

    if (
      CLOSED_ATTEMPT_STATUSES.includes(
        attempt.status
      )
    ) {
      throw new Error(
        "Attempt cannot be abandoned."
      );
    }

    const submittedAt = new Date();

    attempt.status = "ABANDONED";
    attempt.submittedAt =
      submittedAt;

    attempt.timeTakenSeconds =
      attempt.startedAt
        ? Math.max(
            0,
            Math.floor(
              (submittedAt -
                new Date(
                  attempt.startedAt
                )) /
                1000
            )
          )
        : 0;

    await attempt.save();

    return {
      success: true,
      attemptId: attempt._id,
      status: attempt.status,
    };
  };

const terminateAttempt =
  async (
    userId,
    attemptId,
    reason = "Security violation"
  ) => {
    const attempt =
      await getAttemptDocument(
        userId,
        attemptId
      );

    if (
      CLOSED_ATTEMPT_STATUSES.includes(
        attempt.status
      )
    ) {
      return {
        success: true,
        attemptId: attempt._id,
        status: attempt.status,
        reason,
      };
    }

    const now = new Date();

    attempt.status = "TERMINATED";
    attempt.terminatedAt = now;
    attempt.submittedAt = now;

    attempt.timeTakenSeconds =
      attempt.startedAt
        ? Math.max(
            0,
            Math.floor(
              (now -
                new Date(
                  attempt.startedAt
                )) /
                1000
            )
          )
        : 0;

    attempt.security =
      attempt.security || {};

    attempt.security.status =
      "TERMINATED";

    attempt.security.lastEventType =
      "WINDOW_BLUR";

    attempt.security.lastEventAt =
      now;

    if (
      Array.isArray(
        attempt.security.events
      )
    ) {
      attempt.security.events.push({
        type: "WINDOW_BLUR",
        message: reason,
        timestamp: now,
        countedAsViolation: true,
        metadata: {
          terminated: true,
          reason,
        },
      });
    }

    await attempt.save();

    return {
      success: true,
      attemptId: attempt._id,
      status: attempt.status,
      reason,
    };
  };

const canModifyAttempt = (
  attempt
) => {
  return Boolean(
    attempt &&
      attempt.status ===
        "IN_PROGRESS" &&
      getRemainingSeconds(attempt) > 0
  );
};

const generateAIMockTest = async ({
  userId,
  category,
  topics = [],
  difficulty = "Medium",
  questionCount = 20,
  durationMinutes = 30,
  questionTypes = [
    "MCQ_SINGLE",
  ],
  negativeMarking = false,
  negativeMarks = 0,
  aiEvaluation = true,
  title = "",
}) => {
  if (!category) {
    throw new Error(
      "Category is required."
    );
  }

  const count =
    Number(questionCount);

  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > 100
  ) {
    throw new Error(
      "Question count must be between 1 and 100."
    );
  }

  const duration =
    Number(durationMinutes);

  if (
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > 300
  ) {
    throw new Error(
      "Duration must be between 1 and 300 minutes."
    );
  }

  if (
    !Array.isArray(questionTypes) ||
    questionTypes.length === 0
  ) {
    throw new Error(
      "At least one question type is required."
    );
  }

  const selectedTypes =
    questionTypes.filter(
      (type) =>
        VALID_QUESTION_TYPES.includes(
          type
        )
    );

  if (!selectedTypes.length) {
    throw new Error(
      "No valid question types selected."
    );
  }

  const generated =
    await generateMockTestQuestions({
      category,
      topics: Array.isArray(topics)
        ? topics
        : [],
      difficulty,
      questionCount: count,
      questionTypes:
        selectedTypes,
      negativeMarking:
        Boolean(negativeMarking),
      negativeMarks:
        Number(negativeMarks) || 0,
    });

  if (
    !generated ||
    !Array.isArray(
      generated.questions
    )
  ) {
    throw new Error(
      "AI did not generate valid questions."
    );
  }

  if (
    generated.questions.length !==
    count
  ) {
    throw new Error(
      `AI generated ${generated.questions.length} questions instead of ${count}.`
    );
  }

  const questions =
    generated.questions.map(
      (question, index) => {
        const type =
          question.type;

        if (
          !VALID_QUESTION_TYPES.includes(
            type
          )
        ) {
          throw new Error(
            `Question ${index + 1} has invalid question type.`
          );
        }

        if (
          !selectedTypes.includes(
            type
          )
        ) {
          throw new Error(
            `Question ${index + 1} has type ${type}, which was not selected.`
          );
        }

        let options =
          Array.isArray(
            question.options
          )
            ? question.options
                .map((item) =>
                  String(item).trim()
                )
                .filter(Boolean)
            : [];

        let correctAnswer =
          Array.isArray(
            question.correctAnswer
          )
            ? question.correctAnswer
                .map((item) =>
                  String(item).trim()
                )
                .filter(Boolean)
            : [];

        if (
          type === "TRUE_FALSE"
        ) {
          options = [
            "true",
            "false",
          ];

          correctAnswer =
            correctAnswer
              .slice(0, 1)
              .map((answer) =>
                String(
                  answer
                ).toLowerCase()
              );
        }

        if (type === "THEORY") {
          options = [];
          correctAnswer = [];
        }

        const marks =
          Number(question.marks) > 0
            ? Number(question.marks)
            : 2;

        const questionNegative =
          Boolean(negativeMarking)
            ? Math.max(
                0,
                Number(
                  question.negativeMarks ??
                    negativeMarks ??
                    0
                )
              )
            : 0;

        return {
          testId: null,
          questionNumber:
            index + 1,
          type,
          question:
            String(
              question.question || ""
            ).trim(),
          options,
          correctAnswer,
          evaluationCriteria:
            Array.isArray(
              question.evaluationCriteria
            )
              ? question.evaluationCriteria
                  .map((item) =>
                    String(item).trim()
                  )
                  .filter(Boolean)
              : [],
          expectedAnswer:
            String(
              question.expectedAnswer || ""
            ).trim(),
          marks,
          negativeMarks:
            questionNegative,
          difficulty:
            [
              "Easy",
              "Medium",
              "Hard",
            ].includes(
              question.difficulty
            )
              ? question.difficulty
              : [
                  "Easy",
                  "Medium",
                  "Hard",
                ].includes(difficulty)
              ? difficulty
              : "Medium",
          category,
          topics:
            Array.isArray(
              question.topics
            ) &&
            question.topics.length
              ? question.topics
              : topics,
          tags:
            Array.isArray(
              question.tags
            )
              ? question.tags
              : [],
          explanation:
            String(
              question.explanation || ""
            ).trim(),
          isActive: true,
        };
      }
    );

  questions.forEach(
    (question) => {
      if (!question.question) {
        throw new Error(
          `Question ${question.questionNumber} is empty.`
        );
      }

      if (
        question.type ===
        "MCQ_SINGLE"
      ) {
        if (
          question.options.length <
          2
        ) {
          throw new Error(
            `Question ${question.questionNumber} needs at least 2 options.`
          );
        }

        if (
          question.correctAnswer
            .length !== 1
        ) {
          throw new Error(
            `Question ${question.questionNumber} must have exactly one correct answer.`
          );
        }

        if (
          !question.options.includes(
            question.correctAnswer[0]
          )
        ) {
          throw new Error(
            `Question ${question.questionNumber} has a correct answer that is not present in options.`
          );
        }
      }

      if (
        question.type ===
        "MCQ_MULTIPLE"
      ) {
        if (
          question.options.length <
          2
        ) {
          throw new Error(
            `Question ${question.questionNumber} needs at least 2 options.`
          );
        }

        if (
          question.correctAnswer
            .length < 2
        ) {
          throw new Error(
            `Question ${question.questionNumber} must have at least two correct answers.`
          );
        }

        const invalidAnswer =
          question.correctAnswer.some(
            (answer) =>
              !question.options.includes(
                answer
              )
          );

        if (invalidAnswer) {
          throw new Error(
            `Question ${question.questionNumber} contains an invalid correct answer.`
          );
        }
      }

      if (
        question.type ===
        "TRUE_FALSE"
      ) {
        if (
          question.correctAnswer
            .length !== 1
        ) {
          throw new Error(
            `Question ${question.questionNumber} must have one TRUE/FALSE answer.`
          );
        }

        if (
          ![
            "true",
            "false",
          ].includes(
            question.correctAnswer[0]
          )
        ) {
          throw new Error(
            `Question ${question.questionNumber} has invalid TRUE/FALSE answer.`
          );
        }
      }

      if (
        question.type === "THEORY" &&
        aiEvaluation &&
        !question.expectedAnswer
      ) {
        throw new Error(
          `Theory question ${question.questionNumber} is missing expected answer.`
        );
      }
    }
  );

  const totalMarks =
    questions.reduce(
      (sum, question) =>
        sum + question.marks,
      0
    );

  const passingMarks =
    Math.ceil(totalMarks * 0.6);

  const slugBase =
    `ai-${category}`
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );

  const slug =
    `${slugBase}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

  let mockTest = null;

  try {
    mockTest =
      await MockTest.create({
        title:
          typeof title ===
            "string" &&
          title.trim()
            ? title.trim()
            : `${category} AI Mock Test`,
        slug,
        description:
          `AI-generated ${category} mock test based on selected topics and difficulty.`,
        category,
        difficulty,
        durationMinutes:
          duration,
        totalQuestions:
          count,
        totalMarks,
        passingMarks,
        questionTypes:
          selectedTypes,
        negativeMarking: {
          enabled:
            Boolean(
              negativeMarking
            ),
          defaultMarks:
            Number(
              negativeMarks
            ) || 0,
        },
        security: {
          fullscreenRequired: true,
          tabSwitchMonitoring: true,
          copyPasteMonitoring: true,
          contextMenuDisabled: true,
          maxViolations: 3,
          autoTerminateOnViolation:
            true,
        },
        aiEvaluation: {
          enabled:
            Boolean(
              aiEvaluation
            ),
          theoryEvaluation:
            Boolean(
              aiEvaluation &&
                selectedTypes.includes(
                  "THEORY"
                )
            ),
          generateFeedback:
            Boolean(
              aiEvaluation
            ),
          generateRecommendations:
            Boolean(
              aiEvaluation
            ),
        },
        isPublished: true,
        isActive: true,
        ...(userId
          ? {
              createdBy: userId,
            }
          : {}),
      });

    const questionDocuments =
      questions.map(
        (question) => ({
          ...question,
          testId:
            mockTest._id,
        })
      );

    await MockQuestion.insertMany(
      questionDocuments,
      {
        ordered: true,
      }
    );
  } catch (error) {
    if (mockTest?._id) {
      await MockQuestion.deleteMany({
        testId:
          mockTest._id,
      }).catch(() => {});

      await MockTest.deleteOne({
        _id: mockTest._id,
      }).catch(() => {});
    }

    throw error;
  }

  return {
    test: {
      _id: mockTest._id,
      id: mockTest._id,
      title: mockTest.title,
      description:
        mockTest.description,
      category:
        mockTest.category,
      difficulty:
        mockTest.difficulty,
      durationMinutes:
        mockTest.durationMinutes,
      totalQuestions:
        mockTest.totalQuestions,
      totalMarks:
        mockTest.totalMarks,
      passingMarks:
        mockTest.passingMarks,
      questionTypes:
        mockTest.questionTypes,
      negativeMarking:
        mockTest.negativeMarking,
      aiEvaluation:
        mockTest.aiEvaluation,
    },
    questionsGenerated:
      questions.length,
  };
};

const submitTest = async (
  userId,
  attemptId
) => {
  if (!userId) {
    throw new Error(
      "User authentication required."
    );
  }

  if (!attemptId) {
    throw new Error(
      "Attempt ID is required."
    );
  }

  if (!isValidObjectId(attemptId)) {
    throw new Error(
      "Invalid attempt ID."
    );
  }

  const attempt =
    await MockAttempt.findOne({
      _id: attemptId,
      userId,
    }).lean();

  if (!attempt) {
    throw new Error(
      "Attempt not found."
    );
  }

  if (
    attempt.status === "COMPLETED"
  ) {
    if (attempt.resultId) {
      return {
        alreadySubmitted: true,
        resultId: attempt.resultId,
      };
    }

    throw new Error(
      "This test has already been submitted."
    );
  }

  if (
    attempt.status === "ABANDONED" ||
    attempt.status === "TERMINATED"
  ) {
    throw new Error(
      `Cannot submit an attempt with status ${attempt.status}.`
    );
  }

  const test =
    await MockTest.findById(
      attempt.testId
    ).lean();

  if (!test) {
    throw new Error(
      "Mock test not found."
    );
  }

  const questions =
    await MockQuestion.find({
      testId: attempt.testId,
      isActive: true,
    })
      .sort({
        questionNumber: 1,
      })
      .lean();

  if (!questions.length) {
    throw new Error(
      "No questions found for this test."
    );
  }

  const attemptAnswers =
    attempt.answers || [];

  const answerMap = new Map();

  attemptAnswers.forEach(
    (item) => {
      answerMap.set(
        String(item.questionId),
        item
      );
    }
  );

  let obtainedMarks = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  let mcqScore = 0;
  let mcqMaxScore = 0;

  let theoryScore = 0;
  let theoryMaxScore = 0;

  let theoryPending = false;

  const resultQuestions = [];

  for (const question of questions) {
    const savedAnswer =
      answerMap.get(
        String(question._id)
      );

    const userAnswer =
      normalizeAnswer(
        savedAnswer?.answer
      );

    const marks =
      Number(question.marks) || 0;

    const negativeMarks =
      test.negativeMarking?.enabled
        ? Math.max(
            0,
            Number(
              question.negativeMarks ??
                test.negativeMarking
                  ?.defaultMarks ??
                0
            )
          )
        : 0;

    if (question.type === "THEORY") {
      theoryMaxScore += marks;

      if (userAnswer.length === 0) {
        unansweredCount++;

        resultQuestions.push({
          questionId:
            question._id,
          questionNumber:
            question.questionNumber,
          type:
            question.type,
          question:
            question.question,
          userAnswer: [],
          correctAnswer: [],
          isCorrect: null,
          marks,
          marksAwarded: 0,
          negativeMarks: 0,
          aiEvaluation: {
            enabled:
              Boolean(
                test.aiEvaluation
                  ?.enabled
              ),
            score: 0,
            maxScore: marks,
            feedback: "",
            strengths: [],
            improvements: [],
            status:
              "PENDING",
          },
          explanation:
            question.explanation ||
            "",
          topic:
            Array.isArray(
              question.topics
            ) &&
            question.topics.length
              ? question.topics[0]
              : question.category ||
                "",
          difficulty:
            question.difficulty,
        });

        if (
          test.aiEvaluation
            ?.enabled &&
          test.aiEvaluation
            ?.theoryEvaluation
        ) {
          theoryPending = true;
        }

        continue;
      }

      resultQuestions.push({
        questionId:
          question._id,
        questionNumber:
          question.questionNumber,
        type:
          question.type,
        question:
          question.question,
        userAnswer,
        correctAnswer: [],
        isCorrect: null,
        marks,
        marksAwarded: 0,
        negativeMarks: 0,
        aiEvaluation: {
          enabled:
            Boolean(
              test.aiEvaluation
                ?.enabled
            ),
          score: 0,
          maxScore: marks,
          feedback: "",
          strengths: [],
          improvements: [],
          status:
            test.aiEvaluation
              ?.enabled &&
            test.aiEvaluation
              ?.theoryEvaluation
              ? "PENDING"
              : "NOT_REQUIRED",
        },
        explanation:
          question.explanation ||
          "",
        topic:
          Array.isArray(
            question.topics
          ) &&
          question.topics.length
            ? question.topics[0]
            : question.category ||
              "",
        difficulty:
          question.difficulty,
      });

      if (
        test.aiEvaluation
          ?.enabled &&
        test.aiEvaluation
          ?.theoryEvaluation
      ) {
        theoryPending = true;
      }

      continue;
    }

    mcqMaxScore += marks;

    if (userAnswer.length === 0) {
      unansweredCount++;

      resultQuestions.push({
        questionId:
          question._id,
        questionNumber:
          question.questionNumber,
        type:
          question.type,
        question:
          question.question,
        userAnswer: [],
        correctAnswer:
          normalizeAnswer(
            question.correctAnswer
          ),
        isCorrect: false,
        marks,
        marksAwarded: 0,
        negativeMarks,
        aiEvaluation: {
          enabled: false,
          score: 0,
          maxScore: 0,
          feedback: "",
          strengths: [],
          improvements: [],
          status:
            "NOT_REQUIRED",
        },
        explanation:
          question.explanation ||
          "",
        topic:
          Array.isArray(
            question.topics
          ) &&
          question.topics.length
            ? question.topics[0]
            : question.category ||
              "",
        difficulty:
          question.difficulty,
      });

      continue;
    }

    const correctAnswer =
      normalizeAnswer(
        question.correctAnswer
      );

    const submittedSorted =
      [...userAnswer].sort();

    const correctSorted =
      [...correctAnswer].sort();

    const isCorrect =
      JSON.stringify(
        submittedSorted
      ) ===
      JSON.stringify(
        correctSorted
      );

    let marksAwarded = 0;

    if (isCorrect) {
      marksAwarded = marks;
      correctCount++;
    } else {
      marksAwarded =
        negativeMarks > 0
          ? -negativeMarks
          : 0;

      wrongCount++;
    }

    obtainedMarks +=
      marksAwarded;

    mcqScore +=
      marksAwarded;

    resultQuestions.push({
      questionId:
        question._id,
      questionNumber:
        question.questionNumber,
      type:
        question.type,
      question:
        question.question,
      userAnswer,
      correctAnswer,
      isCorrect,
      marks,
      marksAwarded,
      negativeMarks,
      aiEvaluation: {
        enabled: false,
        score: 0,
        maxScore: 0,
        feedback: "",
        strengths: [],
        improvements: [],
        status:
          "NOT_REQUIRED",
      },
      explanation:
        question.explanation ||
        "",
      topic:
        Array.isArray(
          question.topics
        ) &&
        question.topics.length
          ? question.topics[0]
          : question.category ||
            "",
      difficulty:
        question.difficulty,
    });
  }

  obtainedMarks =
    Math.round(
      obtainedMarks * 100
    ) / 100;

  mcqScore =
    Math.round(
      mcqScore * 100
    ) / 100;

  const totalMarks =
    Number(test.totalMarks) ||
    questions.reduce(
      (sum, question) =>
        sum +
        (Number(
          question.marks
        ) || 0),
      0
    );

  const passingMarks =
    Number(test.passingMarks) ||
    Math.ceil(
      totalMarks * 0.6
    );

  const submittedAt =
    new Date();

  const timeTakenSeconds =
    attempt.startedAt
      ? Math.max(
          0,
          Math.floor(
            (submittedAt -
              new Date(
                attempt.startedAt
              )) /
              1000
          )
        )
      : 0;

  const answeredQuestions =
    Math.max(
      0,
      questions.length -
        unansweredCount
    );

  const percentage =
    totalMarks > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (obtainedMarks /
              totalMarks) *
              100
          )
        )
      : 0;

  const passed =
    !theoryPending &&
    obtainedMarks >=
      passingMarks;

  const resultStatus =
    theoryPending
      ? "PARTIAL"
      : "COMPLETED";

  const result =
    await MockResult.create({
      attemptId:
        attempt._id,
      userId,
      testId:
        attempt.testId,
      testTitle:
        test.title,
      category:
        test.category,
      difficulty:
        test.difficulty,
      totalMarks,
      obtainedMarks,
      percentage:
        Math.round(
          percentage * 100
        ) / 100,
      passingMarks,
      passed,
      totalQuestions:
        questions.length,
      answeredQuestions,
      unansweredQuestions:
        unansweredCount,
      correctAnswers:
        correctCount,
      wrongAnswers:
        wrongCount,
      mcqScore,
      mcqMaxScore,
      theoryScore,
      theoryMaxScore,
      durationSeconds:
        Number(
          test.durationMinutes
        ) * 60,
      timeTakenSeconds,
      startedAt:
        attempt.startedAt,
      submittedAt,
      questions:
        resultQuestions,
      categoryPerformance: [],
      topicPerformance: [],
      aiReport: {
        enabled:
          Boolean(
            test.aiEvaluation
              ?.enabled
          ),
        summary:
          theoryPending
            ? "Objective questions have been evaluated. Theory questions are pending AI evaluation."
            : "",
        strengths: [],
        weaknesses: [],
        recommendations: [],
        overallFeedback:
          theoryPending
            ? "AI evaluation is pending for theory questions."
            : "",
        generatedAt:
          theoryPending
            ? undefined
            : submittedAt,
      },
      security: {
        violationCount:
          attempt.security
            ?.violationCount || 0,
        maxViolations:
          attempt.security
            ?.maxViolations ||
          test.security
            ?.maxViolations ||
          3,
        status:
          attempt.security
            ?.status ||
          "SECURE",
      },
      status:
        resultStatus,
    });

  const updatedAttempt =
    await MockAttempt.findOneAndUpdate(
      {
        _id: attemptId,
        userId,
        status: {
          $nin: [
            "COMPLETED",
            "ABANDONED",
            "TERMINATED",
          ],
        },
      },
      {
        $set: {
          status: "COMPLETED",
          submittedAt,
          timeTakenSeconds,
          resultId:
            result._id,
          answeredQuestions,
          unansweredQuestions:
            unansweredCount,
        },
      },
      {
        new: true,
      }
    );

  if (!updatedAttempt) {
    await MockResult.deleteOne({
      _id: result._id,
    });

    throw new Error(
      "Unable to finalize the attempt. It may have already been submitted."
    );
  }

  await MockTest.findByIdAndUpdate(
    attempt.testId,
    {
      $inc: {
        "statistics.completedAttempts": 1,
      },
    }
  );

  return {
    alreadySubmitted: false,
    resultId:
      result._id,
    status:
      result.status,
    obtainedMarks,
    score:
      obtainedMarks,
    totalMarks,
    percentage:
      Math.round(
        percentage * 100
      ) / 100,
    passed,
    passingMarks,
    correctAnswers:
      correctCount,
    wrongAnswers:
      wrongCount,
    unansweredQuestions:
      unansweredCount,
    unanswered:
      unansweredCount,
    answeredQuestions,
    totalQuestions:
      questions.length,
    mcqScore,
    mcqMaxScore,
    theoryScore,
    theoryMaxScore,
    timeTakenSeconds,
    questions:
      resultQuestions,
    questionResults:
      resultQuestions,
  };
};
const getResultById = async (userId, resultId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!resultId) {
    throw new Error("Result ID is required");
  }

  const result = await MockResult.findOne({
    _id: resultId,
    userId,
  }).lean();

  if (!result) {
    const error = new Error(
      "Result not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return result;
};

module.exports = {
  getPublishedTests,
  getTestById,
  getQuestionsForTest,
  getSafeQuestionsForTest,
  startTest,
  getAttempt,
  getAttemptDocument,
  validateActiveAttempt,
  saveAnswer,
  markQuestionForReview,
  updateCurrentQuestion,
  heartbeat,
  getAttemptProgress,
  getUserAttempts,
  abandonAttempt,
  terminateAttempt,
  getRemainingSeconds,
  checkAndUpdateExpiry,
  sanitizeQuestion,
  canModifyAttempt,
  normalizeAnswer,
  normalizeMongoId,
  findAttemptAnswer,
  generateAIMockTest,
  submitTest,
  getResultById,
};