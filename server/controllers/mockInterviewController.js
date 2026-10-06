const MockInterview = require("../models/MockInterview");
const {
  notifyMockInterviewCompleted,
} = require("../services/notificationService");
// ======================================================
// GEMINI
// ======================================================

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

const getGemini = async () => {
  const { GoogleGenAI } = await import("@google/genai");

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing in .env"
    );
  }

  console.log("🔑 Gemini API key detected.");
  console.log("🤖 Gemini model:", GEMINI_MODEL);

  return new GoogleGenAI({
    apiKey,
  });
};

// ======================================================
// CONSTANTS
// ======================================================

const MAX_SECURITY_VIOLATIONS = 3;

const SECURITY_COOLDOWN_MS = 2500;

// Events that count as actual violations.
const VIOLATION_EVENTS = new Set([
  "TAB_SWITCH",
  "FULLSCREEN_EXIT",
  "FACE_NOT_DETECTED",
  "MULTIPLE_FACE_DETECTED",
  "CAMERA_DISCONNECTED",
  "MICROPHONE_DISCONNECTED",
  "COPY_ATTEMPT",
  "PASTE_ATTEMPT",
  "CONTEXT_MENU",
]);

// Events that are only telemetry.
const TELEMETRY_EVENTS = new Set([
  "WINDOW_BLUR",
]);

const VALID_SECURITY_EVENTS = new Set([
  ...VIOLATION_EVENTS,
  ...TELEMETRY_EVENTS,
  "OTHER",
]);

// ======================================================
// HELPERS
// ======================================================

const cleanJsonResponse = (text) => {
  if (!text) {
    throw new Error("Empty AI response");
  }

  return String(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

const clampScore = (value) => {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.min(
    10,
    Math.max(0, n)
  );
};

const clampPercentage = (value) => {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(n))
  );
};

const toSafeString = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

const normalizeArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toSafeString(item))
    .filter(Boolean);
};

const getInterviewForUser = async (
  interviewId,
  userId
) => {
  return MockInterview.findOne({
    _id: interviewId,
    user: userId,
  });
};

// ======================================================
// FALLBACK QUESTIONS
// ======================================================

const getFallbackQuestions = ({
  role,
  company,
  difficulty,
  count,
}) => {
  const roleLower = String(
    role || ""
  ).toLowerCase();

  let bank = [];

  // ----------------------------------------------------
  // JAVA
  // ----------------------------------------------------

  if (
    roleLower.includes("java") ||
    roleLower.includes("spring")
  ) {
    bank = [
      "Explain the four pillars of Object-Oriented Programming in Java with practical examples.",

      "What is the difference between method overloading and method overriding in Java?",

      "Explain the difference between an interface and an abstract class.",

      "How does a HashMap work internally in Java?",

      "What is the difference between ArrayList and LinkedList?",

      "Explain checked and unchecked exceptions with examples.",

      "What are important Java 8 features that you have used in projects?",

      "Explain the Stream API and give a practical example.",

      "What is the difference between == and equals() in Java?",

      "Explain String, StringBuilder and StringBuffer.",

      "What is multithreading in Java and why is synchronization required?",

      "What is dependency injection in Spring?",

      "Explain how a REST API works in Spring Boot.",

      "How would you handle exceptions globally in a Spring Boot application?",

      "What is the difference between JPA and Hibernate?",

      "Explain @RestController, @Service and @Repository.",

      "How would you design a login API using Spring Boot and JWT?",

      "How would you debug a Spring Boot API returning HTTP 500?",

      "Write the logic to find duplicate elements in an integer array.",

      "Explain how you would optimize a slow Java application.",

      "What happens when you create an object using the new keyword?",

      "Explain the Java Collections Framework.",

      "What is the difference between final, finally and finalize?",

      "How does garbage collection work in Java?",

      "Explain SOLID principles with a Java example.",
    ];
  }

  // ----------------------------------------------------
  // REACT
  // ----------------------------------------------------

  else if (
    roleLower.includes("react")
  ) {
    bank = [
      "What is React and why is it used?",

      "Explain the difference between props and state.",

      "What is the useEffect hook?",

      "How does useState work?",

      "What is component re-rendering in React?",

      "Explain controlled and uncontrolled components.",

      "How do you call a REST API from React?",

      "What is React Router?",

      "How would you protect routes in a React application?",

      "Explain the Context API.",

      "What is the difference between useMemo and useCallback?",

      "How would you optimize a slow React application?",

      "How do you handle forms in React?",

      "How would you implement JWT authentication in React?",

      "How would you debug a React component that is continuously re-rendering?",
    ];
  }

  // ----------------------------------------------------
  // SQL
  // ----------------------------------------------------

  else if (
    roleLower.includes("sql") ||
    roleLower.includes("database")
  ) {
    bank = [
      "What is the difference between WHERE and HAVING?",

      "Explain INNER JOIN, LEFT JOIN and RIGHT JOIN.",

      "What is normalization?",

      "What is a primary key?",

      "What is a foreign key?",

      "What is the difference between DELETE, DROP and TRUNCATE?",

      "What is an index and why does it improve query performance?",

      "Explain GROUP BY with an example.",

      "What is a subquery?",

      "What are aggregate functions in SQL?",

      "How would you find the second highest salary?",

      "How would you find duplicate records?",

      "What is a database transaction?",

      "Explain ACID properties.",

      "How would you optimize a slow SQL query?",
    ];
  }

  // ----------------------------------------------------
  // GENERAL
  // ----------------------------------------------------

  else {
    bank = [
      `Explain the fundamentals of ${role}.`,

      `What are the most important skills required for a ${role}?`,

      `Describe a project you would build as a ${role}.`,

      "Explain a challenging technical problem you solved.",

      "How do you debug an issue when you do not know the root cause?",

      "How do you approach learning a new technology?",

      "Explain a real-world scenario where you would use your main technology.",

      "What are common mistakes beginners make in this field?",

      "How would you improve the performance of an application?",

      "Explain how APIs work.",

      "What is the difference between authentication and authorization?",

      "How would you design a scalable application?",

      "How do you test your code?",

      "Describe a technical failure and how you would recover from it.",

      `Why are you interested in ${
        company || "this company"
      }?`,

      "What would you do if you disagreed with a technical decision made by your team?",

      "How would you debug a production issue?",

      "Explain how you would improve code quality in a team.",

      "What would you do if your application became slow after deployment?",

      "Describe your approach to solving a new programming problem.",
    ];
  }

  // Shuffle questions
  const shuffled = [...bank].sort(
    () => Math.random() - 0.5
  );

  const result = [];

  for (let i = 0; i < count; i++) {
    result.push(
      shuffled[i % shuffled.length]
    );
  }

  return result;
};

// ======================================================
// START INTERVIEW
// ======================================================

const startInterview = async (
  req,
  res
) => {
  try {
    const {
      role = "Java Developer",
      company = "General",
      level = "Fresher",
      difficulty = "Intermediate",
      duration = "30 Mins",
      language = "English",
      interviewType = "Technical",
    } = req.body || {};

    const requestedQuestionCount =
      Math.min(
        30,
        Math.max(
          1,
          Number.parseInt(
            req.body?.questionCount,
            10
          ) || 10
        )
      );

    console.log(
      "=========================================="
    );

    console.log(
      "🚀 STARTING MOCK INTERVIEW"
    );

    console.log(
      "=========================================="
    );

    console.log({
      role,
      company,
      level,
      difficulty,
      duration,
      language,
      interviewType,
      requestedQuestionCount,
    });

    let generatedQuestions = [];

    // ==================================================
    // AI QUESTION GENERATION
    // ==================================================

    try {
      const ai = await getGemini();

      const prompt = `
You are an expert placement interviewer.

Create EXACTLY ${requestedQuestionCount}
high-quality interview questions.

Candidate configuration:

Role: ${role}
Company: ${company}
Level: ${level}
Difficulty: ${difficulty}
Interview Type: ${interviewType}
Language: ${language}
Duration: ${duration}

Requirements:

- Generate EXACTLY ${requestedQuestionCount} questions.
- Questions must be useful for placement preparation.
- Questions must be relevant to ${role}.
- Consider ${company} interview style where appropriate.
- Match ${difficulty} difficulty.
- Start with fundamentals and progressively increase difficulty.
- Include practical questions.
- Include scenario-based questions.
- Include problem-solving questions.
- Include real-world development questions.
- Avoid duplicates.
- Avoid meaningless generic questions.
- Do not provide answers.
- Return ONLY JSON.

Format:

{
  "questions": [
    "Question 1",
    "Question 2"
  ]
}

The questions array MUST contain exactly
${requestedQuestionCount} items.
`;

      const response =
        await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType:
              "application/json",
          },
        });

      const parsed =
        JSON.parse(
          cleanJsonResponse(
            response.text
          )
        );

      if (
        Array.isArray(
          parsed.questions
        )
      ) {
        generatedQuestions =
          parsed.questions
            .filter(
              (q) =>
                typeof q === "string" &&
                q.trim()
            )
            .map((q) =>
              q.trim()
            );
      }

      console.log(
        "✅ Gemini generated:",
        generatedQuestions.length,
        "questions"
      );
    } catch (error) {
      // ==================================================
      // IMPORTANT FIX
      // ==================================================
      //
      // DO NOT USE savedAnswer HERE.
      //
      // savedAnswer belongs to submitAnswer().
      //
      // This catch only handles Gemini question
      // generation failure.
      // ==================================================

      console.error("");
      console.error(
        "=========================================="
      );
      console.error(
        "❌ GEMINI QUESTION GENERATION FAILED"
      );
      console.error(
        "=========================================="
      );

      console.error(
        "Error:",
        error?.message
      );

      console.error(
        "Name:",
        error?.name
      );

      console.error(
        "Stack:",
        error?.stack
      );

      console.error(
        "=========================================="
      );

      console.error("");

      // IMPORTANT:
      // We do NOT return here.
      //
      // The fallback question bank below
      // will generate the questions.
    }

    // ==================================================
    // FALLBACK QUESTIONS
    // ==================================================

    const fallbackQuestions =
      getFallbackQuestions({
        role,
        company,
        difficulty,
        count:
          requestedQuestionCount,
      });

    // Remove duplicates from AI questions.
    generatedQuestions = [
      ...new Set(
        generatedQuestions
      ),
    ];

    // Fill missing questions.
    for (
      let i = generatedQuestions.length;
      i < requestedQuestionCount;
      i++
    ) {
      generatedQuestions.push(
        fallbackQuestions[
          i % fallbackQuestions.length
        ]
      );
    }

    // Make sure we return exactly
    // the requested number.
    generatedQuestions =
      generatedQuestions.slice(
        0,
        requestedQuestionCount
      );

    if (
      generatedQuestions.length !==
      requestedQuestionCount
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Unable to generate the requested number of questions.",
      });
    }

    console.log(
      "✅ Final question count:",
      generatedQuestions.length
    );

    // ==================================================
    // CREATE INTERVIEW
    // ==================================================

    const interview =
      await MockInterview.create({
        user: req.user._id,

        role,

        company,

        level,

        difficulty,

        duration,

        language,

        interviewType,

        questions:
          generatedQuestions,

        totalQuestions:
          requestedQuestionCount,

        answers: [],

        attemptedQuestions: 0,

        overallScore: 0,

        technicalScore: 0,

        communicationScore: 0,

        confidenceScore: 0,

        feedback: "",

        strengths: [],

        weaknesses: [],

        suggestions: [],

        reportGenerated: false,

        security: {
          violationCount: 0,

          status: "Secure",

          events: [],

          tabSwitches: 0,

          fullscreenExits: 0,

          faceWarnings: 0,

          multipleFaceWarnings: 0,

          cameraDisconnects: 0,

          microphoneDisconnects: 0,

          copyPasteAttempts: 0,

          lastEventAt: null,

          lastEventType: null,
        },

        status: "Started",

        startedAt: new Date(),
      });

    console.log(
      "✅ Interview created:",
      interview._id
    );

    return res.status(201).json({
      success: true,

      interview,

      questions:
        generatedQuestions,

      questionCount:
        requestedQuestionCount,
    });
  } catch (error) {
    console.error(
      "❌ START INTERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to start interview",
    });
  }
};

// ======================================================
// AI ANSWER EVALUATION
// ======================================================

const evaluateAnswerWithAI = async ({
  interview,
  question,
  answer,
}) => {
  const ai = await getGemini();

  const prompt = `
You are a strict but fair placement interviewer.

Evaluate the candidate's answer.

Role:
${interview.role}

Company:
${interview.company}

Level:
${interview.level}

Difficulty:
${interview.difficulty}

Question:
${question}

Candidate Answer:
${answer}

Evaluate ONLY the information actually provided
by the candidate.

Evaluate:

1. Technical correctness
2. Relevance
3. Completeness
4. Understanding
5. Clarity

Rules:

- Score from 0 to 10.
- Do not give credit for information not provided.
- Partial answers receive partial scores.
- Incorrect answers receive low scores.
- Be fair to fresher candidates.
- Do not assume knowledge that the candidate did not demonstrate.
- Explain what was good.
- Explain what was wrong or missing.
- Give a practical improvement.
- Give a concise expected answer.
- Do not invent candidate behavior.

Return ONLY JSON:

{
  "score": 0,
  "isCorrect": false,
  "expectedAnswer": "",
  "whatWasGood": "",
  "whatWasWrong": "",
  "improvement": "",
  "feedback": ""
}
`;

  const response =
    await ai.models.generateContent({
      model: GEMINI_MODEL,

      contents: prompt,

      config: {
        temperature: 0.2,

        responseMimeType:
          "application/json",
      },
    });

  const evaluation =
    JSON.parse(
      cleanJsonResponse(
        response.text
      )
    );

  return {
    score: clampScore(
      evaluation.score
    ),

    maxScore: 10,

    isCorrect:
      Boolean(
        evaluation.isCorrect
      ),

    expectedAnswer:
      toSafeString(
        evaluation.expectedAnswer
      ),

    whatWasGood:
      toSafeString(
        evaluation.whatWasGood
      ),

    whatWasWrong:
      toSafeString(
        evaluation.whatWasWrong
      ),

    improvement:
      toSafeString(
        evaluation.improvement
      ),

    feedback:
      toSafeString(
        evaluation.feedback
      ),
  };
};

// ======================================================
// SUBMIT ANSWER + REAL-TIME AI EVALUATION
// ======================================================

const submitAnswer = async (
  req,
  res
) => {
  try {
    const interview =
      await getInterviewForUser(
        req.params.id,
        req.user._id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message:
          "Interview not found",
      });
    }

    // --------------------------------------------------
    // INTERVIEW STATUS
    // --------------------------------------------------

    if (
      interview.status ===
        "Completed" ||
      interview.status ===
        "Terminated"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This interview is no longer active.",
      });
    }

    const {
      question,
      questionIndex,
      answer = "",
    } = req.body || {};

    if (!question) {
      return res.status(400).json({
        success: false,
        message:
          "Question is required",
      });
    }

    const cleanAnswer =
      String(answer || "").trim();

    // --------------------------------------------------
    // QUESTION INDEX
    // --------------------------------------------------

    let parsedIndex =
      Number.isInteger(
        Number(questionIndex)
      )
        ? Number(questionIndex)
        : interview.questions.findIndex(
            (q) =>
              String(q) ===
              String(question)
          );

    // If supplied index is invalid,
    // find question from actual interview.
    if (
      parsedIndex < 0 ||
      parsedIndex >=
        interview.totalQuestions
    ) {
      parsedIndex =
        interview.questions.findIndex(
          (q) =>
            String(q) ===
            String(question)
        );
    }

    if (
      parsedIndex < 0 ||
      parsedIndex >=
        interview.questions.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid question index.",
      });
    }

    // --------------------------------------------------
    // DUPLICATE PROTECTION
    // --------------------------------------------------

    const existingAnswer =
      interview.answers.find(
        (item) =>
          Number(
            item.questionIndex
          ) === parsedIndex
      );

    if (existingAnswer) {
      return res.json({
        success: true,

        duplicate: true,

        evaluationAvailable:
          existingAnswer.evaluationStatus ===
          "completed",

        answer:
          existingAnswer,

        evaluation: {
          score:
            existingAnswer.score || 0,

          maxScore:
            existingAnswer.maxScore ||
            10,

          isCorrect:
            Boolean(
              existingAnswer.isCorrect
            ),

          expectedAnswer:
            existingAnswer.expectedAnswer ||
            "",

          whatWasGood:
            existingAnswer.whatWasGood ||
            "",

          whatWasWrong:
            existingAnswer.whatWasWrong ||
            "",

          improvement:
            existingAnswer.improvement ||
            "",

          feedback:
            existingAnswer.feedback ||
            "",

          evaluationStatus:
            existingAnswer.evaluationStatus,
        },

        progress: {
          questionNumber:
            parsedIndex + 1,

          totalQuestions:
            interview.totalQuestions,

          attemptedQuestions:
            interview.attemptedQuestions,

          evaluatedQuestions:
            interview.answers.filter(
              (item) =>
                item.evaluationStatus ===
                "completed"
            ).length,

          liveScore:
            interview.overallScore,
        },
      });
    }

    // ==================================================
    // EMPTY ANSWER
    // ==================================================

    if (!cleanAnswer) {
      const emptyAnswer = {
        question,

        questionIndex:
          parsedIndex,

        answer: "",

        score: 0,

        maxScore: 10,

        isCorrect: false,

        expectedAnswer:
          "A complete answer was expected.",

        whatWasGood:
          "No answer was submitted.",

        whatWasWrong:
          "The question was not attempted.",

        improvement:
          "Attempt the question and explain your reasoning clearly.",

        feedback:
          "No answer submitted.",

        evaluationStatus:
          "completed",

        answeredAt:
          new Date(),

        evaluatedAt:
          new Date(),
      };

      interview.answers.push(
        emptyAnswer
      );

      interview.status =
        "In Progress";

      await updateLiveScore(
        interview
      );

      await interview.save();

      const savedAnswer =
        interview.answers[
          interview.answers.length - 1
        ];

      return res.json({
        success: true,

        evaluationAvailable:
          true,

        evaluation:
          savedAnswer,

        answer:
          savedAnswer,

        progress: {
          questionNumber:
            parsedIndex + 1,

          totalQuestions:
            interview.totalQuestions,

          attemptedQuestions:
            interview.attemptedQuestions,

          evaluatedQuestions:
            interview.answers.filter(
              (item) =>
                item.evaluationStatus ===
                "completed"
            ).length,

          liveScore:
            interview.overallScore,
        },
      });
    }

    // ==================================================
    // SAVE ANSWER FIRST
    // ==================================================

    const answerDocument = {
      question,

      questionIndex:
        parsedIndex,

      answer:
        cleanAnswer,

      score: 0,

      maxScore: 10,

      isCorrect: false,

      expectedAnswer: "",

      whatWasGood: "",

      whatWasWrong: "",

      improvement: "",

      feedback: "",

      evaluationStatus:
        "evaluating",

      answeredAt:
        new Date(),

      evaluatedAt: null,
    };

    interview.answers.push(
      answerDocument
    );

    interview.status =
      "In Progress";

    await interview.save();

    // Get actual Mongoose subdocument.
    const savedAnswer =
      interview.answers[
        interview.answers.length - 1
      ];

    // ==================================================
    // AI EVALUATION
    // ==================================================

    let evaluation;

    try {
      evaluation =
        await evaluateAnswerWithAI({
          interview,
          question,
          answer: cleanAnswer,
        });
    } catch (error) {
      console.error(
        "❌ AI ANSWER EVALUATION ERROR:",
        error?.message
      );

      // IMPORTANT:
      // Keep the candidate's answer.
      // Do not delete it.
      // Do not give fake score.

      savedAnswer.score = 0;

      savedAnswer.maxScore = 10;

      savedAnswer.isCorrect = false;

      savedAnswer.expectedAnswer =
        "AI evaluation was unavailable for this answer.";

      savedAnswer.whatWasGood =
        "Your answer was successfully recorded.";

      savedAnswer.whatWasWrong =
        "The AI evaluator could not analyze this answer.";

      savedAnswer.improvement =
        "Review the question manually and try again.";

      savedAnswer.feedback =
        "Answer recorded, but AI evaluation is temporarily unavailable.";

      savedAnswer.evaluationStatus =
        "failed";

      savedAnswer.evaluatedAt =
        new Date();

      await updateLiveScore(
        interview
      );

      await interview.save();

      return res.status(200).json({
        success: true,

        evaluationAvailable:
          false,

        retryable: true,

        message:
          "Answer recorded, but AI evaluation is temporarily unavailable.",

        error:
          process.env.NODE_ENV ===
          "production"
            ? undefined
            : error?.message,

        evaluation: {
          score: 0,

          maxScore: 10,

          isCorrect: false,

          expectedAnswer:
            savedAnswer.expectedAnswer,

          whatWasGood:
            savedAnswer.whatWasGood,

          whatWasWrong:
            savedAnswer.whatWasWrong,

          improvement:
            savedAnswer.improvement,

          feedback:
            savedAnswer.feedback,

          evaluationStatus:
            "failed",
        },

        answer:
          savedAnswer,

        progress: {
          questionNumber:
            parsedIndex + 1,

          totalQuestions:
            interview.totalQuestions,

          attemptedQuestions:
            interview.attemptedQuestions,

          evaluatedQuestions:
            interview.answers.filter(
              (item) =>
                item.evaluationStatus ===
                "completed"
            ).length,

          liveScore:
            interview.overallScore,
        },
      });
    }

    // ==================================================
    // SAVE AI EVALUATION
    // ==================================================

    savedAnswer.score =
      evaluation.score;

    savedAnswer.maxScore = 10;

    savedAnswer.isCorrect =
      evaluation.isCorrect;

    savedAnswer.expectedAnswer =
      evaluation.expectedAnswer;

    savedAnswer.whatWasGood =
      evaluation.whatWasGood;

    savedAnswer.whatWasWrong =
      evaluation.whatWasWrong;

    savedAnswer.improvement =
      evaluation.improvement;

    savedAnswer.feedback =
      evaluation.feedback;

    savedAnswer.evaluationStatus =
      "completed";

    savedAnswer.evaluatedAt =
      new Date();

    // ==================================================
    // UPDATE LIVE SCORE
    // ==================================================

    await updateLiveScore(
      interview
    );

    await interview.save();

    const completedAnswers =
      interview.answers.filter(
        (item) =>
          item.evaluationStatus ===
          "completed"
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.json({
      success: true,

      evaluationAvailable:
        true,

      evaluation: {
        score:
          evaluation.score,

        maxScore: 10,

        isCorrect:
          evaluation.isCorrect,

        expectedAnswer:
          evaluation.expectedAnswer,

        whatWasGood:
          evaluation.whatWasGood,

        whatWasWrong:
          evaluation.whatWasWrong,

        improvement:
          evaluation.improvement,

        feedback:
          evaluation.feedback,

        evaluationStatus:
          "completed",
      },

      answer:
        savedAnswer,

      progress: {
        questionNumber:
          parsedIndex + 1,

        totalQuestions:
          interview.totalQuestions,

        attemptedQuestions:
          interview.attemptedQuestions,

        evaluatedQuestions:
          completedAnswers.length,

        liveScore:
          interview.overallScore,
      },
    });
  } catch (error) {
    console.error(
      "❌ SUBMIT ANSWER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to evaluate answer",
    });
  }
};

// ======================================================
// LIVE SCORE
// ======================================================

async function updateLiveScore(
  interview
) {
  const answers =
    interview.answers || [];

  const evaluatedAnswers =
    answers.filter(
      (item) =>
        item.evaluationStatus ===
        "completed"
    );

  const attemptedAnswers =
    answers.filter(
      (item) =>
        item.answer &&
        String(item.answer).trim()
          .length > 0
    );

  interview.attemptedQuestions =
    attemptedAnswers.length;

  // No evaluated answers.
  if (!evaluatedAnswers.length) {
    interview.overallScore = 0;
    return;
  }

  const earned =
    evaluatedAnswers.reduce(
      (sum, item) =>
        sum +
        Number(item.score || 0),
      0
    );

  const possible =
    evaluatedAnswers.length * 10;

  interview.overallScore =
    possible > 0
      ? Math.round(
          (earned / possible) * 100
        )
      : 0;
}

// ======================================================
// FINAL REPORT
// ======================================================

const getInterviewReport = async (
  req,
  res
) => {
  try {
    const interview =
      await getInterviewForUser(
        req.params.id,
        req.user._id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message:
          "Interview not found",
      });
    }

    const answers =
      interview.answers || [];

    const attemptedAnswers =
      answers.filter(
        (item) =>
          item.answer &&
          String(item.answer).trim()
      );

    interview.attemptedQuestions =
      attemptedAnswers.length;

    // ==================================================
    // NO ANSWERS
    // ==================================================

    if (
      attemptedAnswers.length === 0
    ) {
      interview.overallScore = 0;

      interview.technicalScore = 0;

      interview.communicationScore = 0;

      interview.confidenceScore = 0;

      interview.feedback =
        "No answers were submitted for this interview.";

      interview.strengths = [];

      interview.weaknesses = [
        "No questions were attempted.",
      ];

      interview.suggestions = [
        "Attempt the interview questions before reviewing the report.",
      ];

      const wasAlreadyCompleted =
    interview.reportGenerated === true;

      interview.reportGenerated = true;

      if (
        interview.status !== "Terminated"
      ) {
        interview.status = "Completed";
      }

      interview.completedAt = new Date();

      await interview.save();

      /*
      ======================================================
      CREATE NOTIFICATION AFTER INTERVIEW COMPLETION
      ======================================================
      */

      if (!wasAlreadyCompleted) {
        await notifyMockInterviewCompleted({
          userId: req.user._id,
          role:
            interview.role ||
            "AI Mock Interview",
          score:
            interview.overallScore || 0,
        });
      }

      return res.json({
        success: true,

        report: {
          score: 0,

          technicalScore: 0,

          communicationScore: 0,

          confidenceScore: 0,

          attemptedQuestions: 0,

          totalQuestions:
            interview.totalQuestions,

          feedback:
            interview.feedback,

          strengths: [],

          weaknesses:
            interview.weaknesses,

          suggestions:
            interview.suggestions,

          questionAnalysis:
            interview.answers,

          security:
            interview.security,
        },
      });
    }

    // ==================================================
    // ACTUAL SCORE
    // ==================================================

    const evaluated =
      answers.filter(
        (item) =>
          item.evaluationStatus ===
          "completed"
      );

    const totalEarned =
      evaluated.reduce(
        (sum, item) =>
          sum +
          Number(item.score || 0),
        0
      );

    const totalPossible =
      evaluated.length * 10;

    const overallScore =
      totalPossible > 0
        ? Math.round(
            (totalEarned /
              totalPossible) *
              100
          )
        : 0;

    interview.overallScore =
      overallScore;

    // ==================================================
    // FINAL AI SUMMARY
    // ==================================================

    let finalEvaluation = null;

    try {
      const ai = await getGemini();

      const answersText =
        answers
          .map(
            (item, index) => `
Question ${index + 1}:
${item.question}

Candidate Answer:
${item.answer || "No answer"}

Score:
${item.score || 0}/10

Feedback:
${item.feedback || "Not evaluated"}

What Was Good:
${item.whatWasGood || "N/A"}

What Was Wrong/Missing:
${item.whatWasWrong || "N/A"}

Improvement:
${item.improvement || "N/A"}
`
          )
          .join("\n\n");

      const prompt = `
You are a senior placement interview evaluator.

Create a final performance report based ONLY
on the candidate's actual answers.

Role:
${interview.role}

Company:
${interview.company}

Level:
${interview.level}

Difficulty:
${interview.difficulty}

Total Questions:
${interview.totalQuestions}

Attempted:
${interview.attemptedQuestions}

Actual calculated score:
${overallScore}/100

Question evaluations:

${answersText}

Return ONLY JSON:

{
  "technicalScore": 0,
  "communicationScore": 0,
  "confidenceScore": 0,
  "feedback": "",
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Rules:

- Scores must be between 0 and 100.
- Base everything on actual answers.
- Do not invent candidate behavior.
- Do not claim the candidate demonstrated something that is not present.
- Give useful placement-preparation advice.
`;

      const response =
        await ai.models.generateContent({
          model: GEMINI_MODEL,

          contents: prompt,

          config: {
            temperature: 0.2,

            responseMimeType:
              "application/json",
          },
        });

      finalEvaluation =
        JSON.parse(
          cleanJsonResponse(
            response.text
          )
        );
    } catch (error) {
      console.error(
        "❌ FINAL REPORT AI ERROR:",
        error?.message
      );

      // Do not fake overall score.
      // Use the actual calculated score.

      finalEvaluation = {
        technicalScore:
          overallScore,

        communicationScore:
          overallScore,

        confidenceScore:
          overallScore,

        feedback:
          "Question-level AI evaluations are available. Final AI summary generation is temporarily unavailable.",

        strengths: [],

        weaknesses: [
          "Final AI summary could not be generated.",
        ],

        suggestions: [
          "Review each question-level evaluation.",
          "Practice the areas identified as weak.",
        ],
      };
    }

    // ==================================================
    // SAVE FINAL REPORT
    // ==================================================

    interview.technicalScore =
      clampPercentage(
        finalEvaluation.technicalScore
      );

    interview.communicationScore =
      clampPercentage(
        finalEvaluation.communicationScore
      );

    interview.confidenceScore =
      clampPercentage(
        finalEvaluation.confidenceScore
      );

    interview.feedback =
      toSafeString(
        finalEvaluation.feedback
      );

    interview.strengths =
      normalizeArray(
        finalEvaluation.strengths
      );

    interview.weaknesses =
      normalizeArray(
        finalEvaluation.weaknesses
      );

    interview.suggestions =
      normalizeArray(
        finalEvaluation.suggestions
      );

    interview.reportGenerated =
      true;

    if (
      interview.status !==
      "Terminated"
    ) {
      interview.status =
        "Completed";
    }

    interview.completedAt =
      new Date();

    await interview.save();

    return res.json({
      success: true,

      report: {
        score:
          interview.overallScore,

        technicalScore:
          interview.technicalScore,

        communicationScore:
          interview.communicationScore,

        confidenceScore:
          interview.confidenceScore,

        attemptedQuestions:
          interview.attemptedQuestions,

        totalQuestions:
          interview.totalQuestions,

        feedback:
          interview.feedback,

        strengths:
          interview.strengths,

        weaknesses:
          interview.weaknesses,

        suggestions:
          interview.suggestions,

        questionAnalysis:
          interview.answers,

        security:
          interview.security,
      },
    });
  } catch (error) {
    console.error(
      "❌ REPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to generate report",
    });
  }
};

// ======================================================
// GET RESULT
// ======================================================

const getInterviewResult = async (
  req,
  res
) => {
  try {
    const interview =
      await getInterviewForUser(
        req.params.id,
        req.user._id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message:
          "Interview not found",
      });
    }

    const answers =
      interview.answers || [];

    const attemptedQuestions =
      answers.filter(
        (item) =>
          item.answer &&
          String(item.answer).trim()
      ).length;

    const evaluatedQuestions =
      answers.filter(
        (item) =>
          item.evaluationStatus ===
          "completed"
      ).length;

    return res.json({
      success: true,

      interview: {
        _id:
          interview._id,

        role:
          interview.role,

        company:
          interview.company,

        level:
          interview.level,

        difficulty:
          interview.difficulty,

        interviewType:
          interview.interviewType,

        duration:
          interview.duration,

        totalQuestions:
          interview.totalQuestions,

        attemptedQuestions,

        evaluatedQuestions,

        score:
          interview.overallScore,

        overallScore:
          interview.overallScore,

        technicalScore:
          interview.technicalScore,

        communicationScore:
          interview.communicationScore,

        confidenceScore:
          interview.confidenceScore,

        status:
          interview.status,

        reportGenerated:
          interview.reportGenerated,

        feedback:
          interview.feedback,

        strengths:
          interview.strengths,

        weaknesses:
          interview.weaknesses,

        suggestions:
          interview.suggestions,

        // Actual candidate answers
        // and AI evaluations.
        answers,

        security:
          interview.security,

        startedAt:
          interview.startedAt,

        completedAt:
          interview.completedAt,
      },
    });
  } catch (error) {
    console.error(
      "❌ GET RESULT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to fetch result",
    });
  }
};

// ======================================================
// GET INTERVIEW
// ======================================================

const getInterviewById = async (
  req,
  res
) => {
  try {
    const interview =
      await getInterviewForUser(
        req.params.id,
        req.user._id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message:
          "Interview not found",
      });
    }

    return res.json({
      success: true,

      interview,
    });
  } catch (error) {
    console.error(
      "❌ GET INTERVIEW ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to fetch interview",
    });
  }
};

// ======================================================
// SECURITY EVENT
// ======================================================

const recordSecurityEvent = async (
  req,
  res
) => {
  try {
    const {
      type,
      message = "",
    } = req.body || {};

    // --------------------------------------------------
    // VALIDATE TYPE
    // --------------------------------------------------

    if (!type) {
      return res.status(400).json({
        success: false,

        message:
          "Security event type is required",
      });
    }

    if (
      !VALID_SECURITY_EVENTS.has(
        type
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          `Invalid security event type: ${type}`,
      });
    }

    // --------------------------------------------------
    // GET INTERVIEW
    // --------------------------------------------------

    const interview =
      await getInterviewForUser(
        req.params.id,
        req.user._id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,

        message:
          "Interview not found",
      });
    }

    // --------------------------------------------------
    // ALREADY TERMINATED
    // --------------------------------------------------

    if (
      interview.status ===
      "Terminated"
    ) {
      return res.json({
        success: true,

        terminated: true,

        duplicate: false,

        security:
          interview.security,
      });
    }

    // --------------------------------------------------
    // ENSURE SECURITY OBJECT
    // --------------------------------------------------

    if (!interview.security) {
      interview.security = {
        violationCount: 0,

        status: "Secure",

        events: [],

        tabSwitches: 0,

        fullscreenExits: 0,

        faceWarnings: 0,

        multipleFaceWarnings: 0,

        cameraDisconnects: 0,

        microphoneDisconnects: 0,

        copyPasteAttempts: 0,

        lastEventAt: null,

        lastEventType: null,
      };
    }

    const security =
      interview.security;

    // --------------------------------------------------
    // MAX STRIKES
    // --------------------------------------------------

    if (
      Number(
        security.violationCount || 0
      ) >= MAX_SECURITY_VIOLATIONS
    ) {
      security.status =
        "Terminated";

      interview.status =
        "Terminated";

      if (!interview.completedAt) {
        interview.completedAt =
          new Date();
      }

      await interview.save();

      return res.json({
        success: true,

        terminated: true,

        security,
      });
    }

    // --------------------------------------------------
    // SERVER-SIDE COOLDOWN
    // --------------------------------------------------

    const now = new Date();

    const lastEventAt =
      security.lastEventAt
        ? new Date(
            security.lastEventAt
          )
        : null;

    const elapsed =
      lastEventAt
        ? now.getTime() -
          lastEventAt.getTime()
        : Infinity;

    const isDuplicate =
      lastEventAt &&
      elapsed <
        SECURITY_COOLDOWN_MS &&
      security.lastEventType ===
        type;

    if (isDuplicate) {
      return res.json({
        success: true,

        duplicate: true,

        terminated:
          interview.status ===
          "Terminated",

        security: {
          violationCount:
            security.violationCount,

          status:
            security.status,

          tabSwitches:
            security.tabSwitches,

          fullscreenExits:
            security.fullscreenExits,

          faceWarnings:
            security.faceWarnings,

          multipleFaceWarnings:
            security.multipleFaceWarnings,

          cameraDisconnects:
            security.cameraDisconnects,

          microphoneDisconnects:
            security.microphoneDisconnects,

          copyPasteAttempts:
            security.copyPasteAttempts,

          lastEventAt:
            security.lastEventAt,

          lastEventType:
            security.lastEventType,
        },
      });
    }

    // --------------------------------------------------
    // CHECK WHETHER IT COUNTS
    // --------------------------------------------------

    const countsAsViolation =
      VIOLATION_EVENTS.has(
        type
      );

    // --------------------------------------------------
    // SAVE EVENT
    // --------------------------------------------------

    security.events.push({
      type,

      message:
        String(
          message || ""
        ).slice(0, 500),

      timestamp: now,

      countedAsViolation:
        countsAsViolation,
    });

    security.lastEventAt =
      now;

    security.lastEventType =
      type;

    // --------------------------------------------------
    // TELEMETRY ONLY
    // --------------------------------------------------

    if (
      TELEMETRY_EVENTS.has(type)
    ) {
      await interview.save();

      return res.json({
        success: true,

        duplicate: false,

        countedAsViolation:
          false,

        terminated: false,

        security: {
          violationCount:
            security.violationCount,

          status:
            security.status,

          tabSwitches:
            security.tabSwitches,

          fullscreenExits:
            security.fullscreenExits,

          faceWarnings:
            security.faceWarnings,

          multipleFaceWarnings:
            security.multipleFaceWarnings,

          cameraDisconnects:
            security.cameraDisconnects,

          microphoneDisconnects:
            security.microphoneDisconnects,

          copyPasteAttempts:
            security.copyPasteAttempts,

          lastEventAt:
            security.lastEventAt,

          lastEventType:
            security.lastEventType,
        },
      });
    }

    // --------------------------------------------------
    // COUNT REAL VIOLATION
    // --------------------------------------------------

    security.violationCount =
      Math.min(
        MAX_SECURITY_VIOLATIONS,

        Number(
          security.violationCount || 0
        ) + 1
      );

    // --------------------------------------------------
    // TYPE COUNTERS
    // --------------------------------------------------

    switch (type) {
      case "TAB_SWITCH":
        security.tabSwitches =
          Number(
            security.tabSwitches || 0
          ) + 1;
        break;

      case "FULLSCREEN_EXIT":
        security.fullscreenExits =
          Number(
            security.fullscreenExits || 0
          ) + 1;
        break;

      case "FACE_NOT_DETECTED":
        security.faceWarnings =
          Number(
            security.faceWarnings || 0
          ) + 1;
        break;

      case "MULTIPLE_FACE_DETECTED":
        security.multipleFaceWarnings =
          Number(
            security.multipleFaceWarnings || 0
          ) + 1;
        break;

      case "CAMERA_DISCONNECTED":
        security.cameraDisconnects =
          Number(
            security.cameraDisconnects || 0
          ) + 1;
        break;

      case "MICROPHONE_DISCONNECTED":
        security.microphoneDisconnects =
          Number(
            security.microphoneDisconnects || 0
          ) + 1;
        break;

      case "COPY_ATTEMPT":
      case "PASTE_ATTEMPT":
      case "CONTEXT_MENU":
        security.copyPasteAttempts =
          Number(
            security.copyPasteAttempts || 0
          ) + 1;
        break;

      default:
        break;
    }

    // --------------------------------------------------
    // TERMINATION
    // --------------------------------------------------

    if (
      security.violationCount >=
      MAX_SECURITY_VIOLATIONS
    ) {
      security.status =
        "Terminated";

      interview.status =
        "Terminated";

      interview.completedAt =
        now;
    } else {
      security.status =
        "Warning";

      if (
        interview.status ===
        "Started"
      ) {
        interview.status =
          "In Progress";
      }
    }

    await interview.save();

    return res.json({
      success: true,

      duplicate: false,

      countedAsViolation:
        true,

      terminated:
        interview.status ===
        "Terminated",

      security: {
        violationCount:
          security.violationCount,

        status:
          security.status,

        tabSwitches:
          security.tabSwitches,

        fullscreenExits:
          security.fullscreenExits,

        faceWarnings:
          security.faceWarnings,

        multipleFaceWarnings:
          security.multipleFaceWarnings,

        cameraDisconnects:
          security.cameraDisconnects,

        microphoneDisconnects:
          security.microphoneDisconnects,

        copyPasteAttempts:
          security.copyPasteAttempts,

        lastEventAt:
          security.lastEventAt,

        lastEventType:
          security.lastEventType,
      },
    });
  } catch (error) {
    console.error(
      "❌ SECURITY EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to record security event",
    });
  }
};
// ======================================================
// GET ALL MY INTERVIEW REPORTS
// ======================================================

const getMyInterviewReports = async (req, res) => {
  try {
    const interviews = await MockInterview.find({
      user: req.user._id,
    })
      .sort({
        completedAt: -1,
        createdAt: -1,
      })
      .select(
        [
          "_id",
          "role",
          "company",
          "level",
          "difficulty",
          "interviewType",
          "duration",
          "totalQuestions",
          "attemptedQuestions",
          "overallScore",
          "technicalScore",
          "communicationScore",
          "confidenceScore",
          "feedback",
          "strengths",
          "weaknesses",
          "suggestions",
          "answers",
          "security",
          "status",
          "reportGenerated",
          "startedAt",
          "completedAt",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .lean();

    const reports = interviews.map((interview) => {
      const answers = Array.isArray(interview.answers)
        ? interview.answers
        : [];

      const attemptedQuestions = answers.filter(
        (item) =>
          item?.answer &&
          String(item.answer).trim().length > 0
      ).length;

      const evaluatedQuestions = answers.filter(
        (item) =>
          item?.evaluationStatus === "completed"
      ).length;

      return {
        _id: interview._id,

        role: interview.role || "Technical Interview",

        company: interview.company || "General",

        level: interview.level || "Fresher",

        difficulty:
          interview.difficulty || "Intermediate",

        interviewType:
          interview.interviewType || "Technical",

        duration: interview.duration || 0,

        totalQuestions:
          Number(interview.totalQuestions || 0),

        attemptedQuestions,

        evaluatedQuestions,

        overallScore:
          Number(interview.overallScore || 0),

        technicalScore:
          Number(interview.technicalScore || 0),

        communicationScore:
          Number(
            interview.communicationScore || 0
          ),

        confidenceScore:
          Number(
            interview.confidenceScore || 0
          ),

        feedback:
          interview.feedback || "",

        strengths:
          Array.isArray(interview.strengths)
            ? interview.strengths
            : [],

        weaknesses:
          Array.isArray(interview.weaknesses)
            ? interview.weaknesses
            : [],

        suggestions:
          Array.isArray(interview.suggestions)
            ? interview.suggestions
            : [],

        answers,

        security:
          interview.security || {
            violationCount: 0,
            status: "Secure",
            events: [],
            tabSwitches: 0,
            fullscreenExits: 0,
            faceWarnings: 0,
            multipleFaceWarnings: 0,
            cameraDisconnects: 0,
            microphoneDisconnects: 0,
            copyPasteAttempts: 0,
          },

        status:
          interview.status || "Completed",

        reportGenerated:
          Boolean(interview.reportGenerated),

        startedAt: interview.startedAt,

        completedAt: interview.completedAt,

        createdAt: interview.createdAt,

        updatedAt: interview.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,

      count: reports.length,

      reports,
    });
  } catch (error) {
    console.error(
      "GET MY INTERVIEW REPORTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to fetch interview reports",
    });
  }
};
// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  startInterview,

  submitAnswer,

  getInterviewReport,

  getInterviewResult,

  getInterviewById,

  recordSecurityEvent,
  getMyInterviewReports,
};