const mockTestService = require("../services/mockTestService");
const securityService = require("../services/securityService");
const {
  notifyMockTestCompleted,
} = require("../services/notificationService");
const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    null
  );
};
const requireUserId = (req) => {
  const userId = getUserId(req);

  if (!userId) {
    throw new Error(
      "User authentication required."
    );
  }

  return userId;
};
const getMockTests = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
    } = req.query;

    const result =
      await mockTestService.getPublishedTests({
        category,
        difficulty,
        search,
      });

    return res.status(200).json({
      success: true,
      count:
        result?.tests?.length || 0,
      tests:
        result?.tests || [],
    });
  } catch (error) {
    console.error(
      "GET MOCK TESTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to load mock tests.",
    });
  }
};
const getMockTestById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Mock test ID is required.",
      });
    }

    const test =
      await mockTestService.getTestById(
        id
      );

    if (!test) {
      return res.status(404).json({
        success: false,
        message:
          "Mock test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    console.error(
      "GET MOCK TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to load mock test.",
    });
  }
};
const generateMockTest = async (
  req,
  res
) => {
  try {
    console.log(
      "\n================================="
    );

    console.log(
      "🤖 GENERATE AI MOCK TEST"
    );

    console.log(
      "================================="
    );

    console.log(
      "Request Body:",
      req.body
    );
    const userId =
      requireUserId(req);

    console.log(
      "User ID:",
      userId
    );
    const {
      category,
      topics,
      difficulty,
      questionCount,
      durationMinutes,
      questionTypes,
      negativeMarking,
      negativeMarks,
      aiEvaluation,
      title,
    } = req.body || {};
    if (
      !category ||
      typeof category !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category is required.",
      });
    }
    const finalQuestionCount =
      Number(
        questionCount ?? 20
      );

    if (
      !Number.isInteger(
        finalQuestionCount
      ) ||
      finalQuestionCount < 1 ||
      finalQuestionCount > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question count must be between 1 and 100.",
      });
    }
    const finalDuration =
      Number(
        durationMinutes ?? 30
      );

    if (
      !Number.isInteger(
        finalDuration
      ) ||
      finalDuration < 1 ||
      finalDuration > 300
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duration must be between 1 and 300 minutes.",
      });
    }
    const allowedQuestionTypes = [
      "MCQ_SINGLE",
      "MCQ_MULTIPLE",
      "TRUE_FALSE",
      "THEORY",
    ];

    const finalQuestionTypes =
      Array.isArray(questionTypes) &&
      questionTypes.length > 0
        ? questionTypes.filter(
            (type) =>
              allowedQuestionTypes.includes(
                type
              )
          )
        : ["MCQ_SINGLE"];

    if (
      finalQuestionTypes.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one valid question type is required.",
      });
    }
    const finalTopics =
      Array.isArray(topics)
        ? topics
            .filter(
              (topic) =>
                typeof topic ===
                  "string" &&
                topic.trim()
            )
            .map((topic) =>
              topic.trim()
            )
        : [];
    const allowedDifficulties = [
      "Easy",
      "Medium",
      "Hard",
      "Mixed",
    ];

    const finalDifficulty =
      allowedDifficulties.includes(
        difficulty
      )
        ? difficulty
        : "Medium";
    const finalNegativeMarking =
      Boolean(negativeMarking);

    const finalNegativeMarks =
      finalNegativeMarking
        ? Math.max(
            0,
            Number(
              negativeMarks ?? 0
            )
          )
        : 0;
    const finalAIEvaluation =
      aiEvaluation !== false;
    const finalTitle =
      title &&
      typeof title === "string" &&
      title.trim()
        ? title.trim()
        : `AI ${category} Mock Test`;
    const configuration = {
      userId,

      category:
        category.trim(),

      topics:
        finalTopics,

      difficulty:
        finalDifficulty,

      questionCount:
        finalQuestionCount,

      durationMinutes:
        finalDuration,

      questionTypes:
        finalQuestionTypes,

      negativeMarking:
        finalNegativeMarking,

      negativeMarks:
        finalNegativeMarks,

      aiEvaluation:
        finalAIEvaluation,

      title:
        finalTitle,
    };

    console.log(
      "AI MOCK TEST CONFIG:",
      configuration
    );
    const result =
      await mockTestService.generateAIMockTest(
        configuration
      );
    console.log(
      "================================="
    );

    console.log(
      "✅ AI MOCK TEST CREATED"
    );

    console.log(
      "Test ID:",
      result?.test?._id
    );

    console.log(
      "Questions:",
      result?.questionsGenerated
    );

    console.log(
      "=================================\n"
    );

    return res.status(201).json({
      success: true,

      message:
        "AI mock test generated successfully.",

      test:
        result?.test,

      questionsGenerated:
        result?.questionsGenerated ||
        finalQuestionCount,
    });
  } catch (error) {
    console.error(
      "\n================================="
    );

    console.error(
      "❌ GENERATE AI MOCK TEST ERROR"
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "=================================\n"
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to generate AI mock test.",
    });
  }
};
const startMockTest = async (
  req,
  res
) => {
  try {
    const userId =
      requireUserId(req);

    const {
      testId,
    } = req.params;

    if (!testId) {
      return res.status(400).json({
        success: false,
        message:
          "Test ID is required.",
      });
    }

    console.log(
      "\n🚀 START MOCK TEST"
    );

    console.log(
      "User:",
      userId
    );

    console.log(
      "Test:",
      testId
    );

    const result =
      await mockTestService.startTest(
        userId,
        testId
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "START MOCK TEST ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to start test.",
    });
  }
};
const getMockTestAttempt =
  async (req, res) => {
    try {
      const userId =
        requireUserId(req);

      const {
        attemptId,
      } = req.params;

      if (!attemptId) {
        return res.status(400).json({
          success: false,
          message:
            "Attempt ID is required.",
        });
      }

      console.log(
        "📄 Loading attempt:",
        attemptId
      );

      const result =
        await mockTestService.getAttempt(
          userId,
          attemptId
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "GET ATTEMPT ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error?.message ||
          "Unable to load attempt.",
      });
    }
  };
const getAttemptProgress =
  async (req, res) => {
    try {
      const userId =
        requireUserId(req);

      const {
        attemptId,
      } = req.params;

      if (!attemptId) {
        return res.status(400).json({
          success: false,
          message:
            "Attempt ID is required.",
        });
      }

      const progress =
        await mockTestService.getAttemptProgress(
          userId,
          attemptId
        );

      return res.status(200).json({
        success: true,
        progress,
      });
    } catch (error) {
      console.error(
        "GET ATTEMPT PROGRESS ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error?.message ||
          "Unable to load progress.",
      });
    }
  };
const saveAnswer = async (
  req,
  res
) => {
  try {
    const userId =
      requireUserId(req);

    const {
      attemptId,
    } = req.params;
    const body =
      req.body || {};

    const {
      questionId,
      answer,
      currentQuestionIndex,
      markedForReview,
    } = body;

    console.log(
      "\n========================================"
    );

    console.log(
      "💾 SAVE ANSWER REQUEST"
    );

    console.log(
      "========================================"
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "Attempt ID:",
      attemptId
    );

    console.log(
      "Question ID:",
      questionId
    );

    console.log(
      "Answer:",
      answer
    );
    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt ID is required.",
      });
    }
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message:
          "Question ID is required.",
      });
    }
    const result =
      await mockTestService.saveAnswer(
        userId,
        attemptId,
        questionId,
        answer,
        {
          currentQuestionIndex,
          markedForReview,
        }
      );

    console.log(
      "✅ ANSWER SAVED"
    );

    console.log(
      "========================================\n"
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "\n========================================"
    );

    console.error(
      "❌ SAVE ANSWER ERROR"
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "========================================\n"
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to save answer.",
    });
  }
};
const markForReview = async (
  req,
  res
) => {
  try {
    const userId =
      requireUserId(req);

    const {
      attemptId,
    } = req.params;

    const {
      questionId,
      markedForReview,
    } = req.body || {};

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt ID is required.",
      });
    }

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message:
          "Question ID is required.",
      });
    }

    const result =
      await mockTestService.markQuestionForReview(
        userId,
        attemptId,
        questionId,
        Boolean(markedForReview)
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "MARK REVIEW ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update review status.",
    });
  }
};
const updateNavigation =
  async (req, res) => {
    try {
      const userId =
        requireUserId(req);

      const {
        attemptId,
      } = req.params;

      const body =
        req.body || {};

      /*
      | Support both names:
      |
      | currentQuestionIndex
      | questionIndex
      */

      const currentQuestionIndex =
        body.currentQuestionIndex ??
        body.questionIndex ??
        body.index;

      if (!attemptId) {
        return res.status(400).json({
          success: false,
          message:
            "Attempt ID is required.",
        });
      }

      if (
        currentQuestionIndex ===
          undefined ||
        currentQuestionIndex ===
          null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Current question index is required.",
        });
      }

      const result =
        await mockTestService.updateCurrentQuestion(
          userId,
          attemptId,
          Number(currentQuestionIndex)
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "NAVIGATION ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error?.message ||
          "Unable to update navigation.",
      });
    }
  };
const heartbeat = async (req, res) => {
  try {
    const userId = requireUserId(req);

    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Attempt ID is required.",
      });
    }

    const body = req.body || {};

    const {
      securityEvent,
      currentQuestionIndex,
    } = body;

    let securityResult = null;

    if (
      securityEvent &&
      securityEvent.type
    ) {
      securityResult =
        await securityService.recordSecurityEvent(
          userId,
          attemptId,
          securityEvent.type,
          {
            ...(securityEvent.details || {}),
            timestamp:
              securityEvent.timestamp ||
              new Date().toISOString(),
          }
        );

      if (
        securityResult?.terminated
      ) {
        return res.status(200).json({
          success: true,
          terminated: true,
          message:
            "Test terminated due to security violations.",
          security: securityResult,
        });
      }
    }

    const result =
      await mockTestService.heartbeat(
        userId,
        attemptId,
        {
          currentQuestionIndex,
        }
      );

    return res.status(200).json({
      success: true,
      ...result,
      security: securityResult,
    });
  } catch (error) {
    console.error(
      "HEARTBEAT ERROR:",
      error
    );

    return res.status(
      error?.statusCode || 400
    ).json({
      success: false,
      message:
        error?.message ||
        "Heartbeat failed.",
    });
  }
};
const abandonTest = async (
  req,
  res
) => {
  try {
    const userId =
      requireUserId(req);

    const {
      attemptId,
    } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message:
          "Attempt ID is required.",
      });
    }

    const result =
      await mockTestService.abandonAttempt(
        userId,
        attemptId
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "ABANDON TEST ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to abandon test.",
    });
  }
};
const getMockTestResult = async (req, res) => {
  try {
    const userId = requireUserId(req);
    const { resultId } = req.params;

    if (!resultId) {
      return res.status(400).json({
        success: false,
        message: "Result ID is required",
      });
    }

    const result =
      await mockTestService.getResultById(
        userId,
        resultId
      );

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "Get mock test result error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to get mock test result",
    });
  }
};
const getAttemptHistory = async (req, res) => {
  try {
    const userId = requireUserId(req);

    const attempts =
      await mockTestService.getUserAttempts(
        userId
      );

    return res.status(200).json({
      success: true,
      attempts,
    });
  } catch (error) {
    console.error(
      "Get attempt history error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to load attempt history.",
    });
  }
};
const submitMockTest = async (
  req,
  res
) => {
  try {
    const userId = requireUserId(req);

    const {
      attemptId,
    } = req.params;

    console.log(
      "\n========================================"
    );

    console.log(
      "📝 SUBMIT MOCK TEST REQUEST"
    );

    console.log(
      "User:",
      userId
    );

    console.log(
      "Attempt:",
      attemptId
    );

    /*
    =====================================================
    SUBMIT MOCK TEST
    =====================================================
    */

    const result =
      await mockTestService.submitTest(
        userId,
        attemptId
      );

    console.log(
      "✅ MOCK TEST SUBMITTED SUCCESSFULLY"
    );

    /*
    =====================================================
    CREATE NOTIFICATION
    =====================================================

    IMPORTANT:
    Only create the notification AFTER the test
    has been successfully submitted.
    */

    try {
      const percentage = Number(
        result?.percentage ??
        result?.result?.percentage ??
        result?.score ??
        result?.result?.score ??
        0
      );

      const passed =
        result?.passed === true ||
        result?.result?.passed === true;

      const testTitle =
        result?.testTitle ||
        result?.result?.testTitle ||
        result?.test?.title ||
        result?.result?.test?.title ||
        "Mock Test";

      await notifyMockTestCompleted({
        userId,
        testTitle,
        percentage,
        passed,
      });

      console.log(
        "🔔 Mock test notification created"
      );

    } catch (notificationError) {
      /*
        Notification failure should NEVER make
        the mock test submission fail.
      */

      console.error(
        "⚠️ Mock test notification failed:",
        notificationError
      );
    }

    /*
    =====================================================
    RETURN RESULT
    =====================================================
    */

    return res.status(200).json({
      success: true,

      message:
        "Mock test submitted successfully.",

      ...result,
    });

  } catch (error) {
    console.error(
      "❌ SUBMIT MOCK TEST ERROR:",
      error
    );

    return res.status(400).json({
      success: false,

      message:
        error.message ||
        "Unable to submit mock test.",
    });
  }
};
module.exports = {
  getMockTests,
  getMockTestById,
  generateMockTest,
  startMockTest,
  getMockTestAttempt,
  getAttemptProgress,
  saveAnswer,
  markForReview,
  updateNavigation,
  heartbeat,
  abandonTest,
  getAttemptHistory,
  submitMockTest,
  getMockTestResult,
};