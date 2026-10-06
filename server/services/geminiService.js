const { GoogleGenerativeAI } = require("@google/generative-ai");

/*
|--------------------------------------------------------------------------
| Gemini API
|--------------------------------------------------------------------------
*/

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is missing.");
}

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

/*
|--------------------------------------------------------------------------
| Main Gemini Model
|--------------------------------------------------------------------------
*/

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

/*
|--------------------------------------------------------------------------
| Mock Test Models
|--------------------------------------------------------------------------
|
| Your listAvailableModels.js confirmed these models support
| generateContent.
|
*/

const MOCK_TEST_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
];

/*
|--------------------------------------------------------------------------
| Sleep
|--------------------------------------------------------------------------
*/

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

/*
|--------------------------------------------------------------------------
| Clean Gemini JSON
|--------------------------------------------------------------------------
*/

const cleanGeminiJSON = (response) => {
  if (!response) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  let cleaned = String(response).trim();

  cleaned = cleaned.replace(
    /^```json\s*/i,
    ""
  );

  cleaned = cleaned.replace(
    /^```\s*/i,
    ""
  );

  cleaned = cleaned.replace(
    /\s*```$/i,
    ""
  );

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace !== -1 &&
      lastBrace !== -1 &&
      lastBrace > firstBrace
    ) {
      const jsonString =
        cleaned.substring(
          firstBrace,
          lastBrace + 1
        );

      try {
        return JSON.parse(
          jsonString
        );
      } catch (jsonError) {
        throw new Error(
          "Gemini returned invalid JSON."
        );
      }
    }

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }
};

/*
|--------------------------------------------------------------------------
| Gemini Error Status
|--------------------------------------------------------------------------
*/

const getGeminiErrorStatus = (
  error
) => {
  return (
    error?.status ||
    error?.response?.status ||
    null
  );
};

/*
|--------------------------------------------------------------------------
| Temporary Gemini Error
|--------------------------------------------------------------------------
*/

const isTemporaryGeminiError = (
  error
) => {
  const status =
    getGeminiErrorStatus(error);

  return [
    429,
    500,
    502,
    503,
    504,
  ].includes(status);
};

/*
|--------------------------------------------------------------------------
| Generate Gemini Content
|--------------------------------------------------------------------------
*/

const generateWithRetry = async (
  modelName,
  prompt,
  retries = 2
) => {
  let lastError = null;

  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {
    try {
      console.log(
        `🤖 Gemini ${modelName} - attempt ${attempt}/${retries}`
      );

      const model =
        genAI.getGenerativeModel({
          model: modelName,
        });

      const result =
        await model.generateContent(
          prompt
        );

      if (
        !result ||
        !result.response
      ) {
        throw new Error(
          "Gemini returned empty response."
        );
      }

      const text =
        result.response.text();

      if (!text) {
        throw new Error(
          "Gemini returned empty text."
        );
      }

      return text;

    } catch (error) {
      lastError = error;

      console.error(
        `❌ ${modelName} failed`
      );

      console.error(
        "Status:",
        getGeminiErrorStatus(error)
      );

      console.error(
        "Message:",
        error?.message
      );

      if (
        !isTemporaryGeminiError(
          error
        )
      ) {
        throw error;
      }

      if (
        attempt >= retries
      ) {
        throw error;
      }

      const delay =
        2500 *
        Math.pow(
          2,
          attempt - 1
        );

      console.log(
        `⏳ Waiting ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};

/*
|--------------------------------------------------------------------------
| Normalize TRUE/FALSE Answer
|--------------------------------------------------------------------------
|
| Gemini can sometimes return:
|
| ["true"]
| ["TRUE"]
| ["True"]
| [true]
| "true"
| ["TRUE "]
| ["option A"]  -> invalid
|
| We normalize safe variants.
|
*/

const normalizeTrueFalseAnswer = (
  question
) => {
  let rawAnswer =
    question.correctAnswer;

  /*
  |--------------------------------------------------------------------------
  | If correctAnswer is not an array
  |--------------------------------------------------------------------------
  */

  if (
    !Array.isArray(
      rawAnswer
    )
  ) {
    rawAnswer =
      rawAnswer !== undefined &&
      rawAnswer !== null
        ? [rawAnswer]
        : [];
  }

  /*
  |--------------------------------------------------------------------------
  | Search possible answer fields
  |--------------------------------------------------------------------------
  */

  if (
    rawAnswer.length === 0
  ) {
    if (
      question.answer !==
        undefined &&
      question.answer !== null
    ) {
      rawAnswer = [
        question.answer,
      ];
    }
  }

  if (
    rawAnswer.length === 0
  ) {
    if (
      question.correctOption !==
        undefined &&
      question.correctOption !== null
    ) {
      rawAnswer = [
        question.correctOption,
      ];
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize first answer
  |--------------------------------------------------------------------------
  */

  if (
    rawAnswer.length > 0
  ) {
    const value =
      String(
        rawAnswer[0]
      )
        .trim()
        .toLowerCase();

    if (
      value === "true" ||
      value === "t" ||
      value === "yes"
    ) {
      return ["true"];
    }

    if (
      value === "false" ||
      value === "f" ||
      value === "no"
    ) {
      return ["false"];
    }

    /*
    |--------------------------------------------------------------------------
    | Sometimes Gemini returns:
    |
    | "True."
    | "False."
    |--------------------------------------------------------------------------
    */

    if (
      value.startsWith(
        "true"
      )
    ) {
      return ["true"];
    }

    if (
      value.startsWith(
        "false"
      )
    ) {
      return ["false"];
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid
  |--------------------------------------------------------------------------
  */

  return [];
};

/*
|--------------------------------------------------------------------------
| Validate Generated Questions
|--------------------------------------------------------------------------
*/

const validateGeneratedQuestions = (
  questions,
  count
) => {
  if (
    !Array.isArray(
      questions
    )
  ) {
    throw new Error(
      "Gemini did not return a valid questions array."
    );
  }

  if (
    questions.length !== count
  ) {
    throw new Error(
      `Gemini generated ${questions.length} questions instead of ${count}.`
    );
  }

  questions.forEach(
    (question, index) => {
      const number =
        index + 1;

      if (
        !question.question
      ) {
        throw new Error(
          `Question ${number} is empty.`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | MCQ SINGLE
      |--------------------------------------------------------------------------
      */

      if (
        question.type ===
        "MCQ_SINGLE"
      ) {
        if (
          question.options.length <
          4
        ) {
          throw new Error(
            `Question ${number} needs at least 4 options.`
          );
        }

        if (
          question.correctAnswer
            .length !== 1
        ) {
          throw new Error(
            `Question ${number} must have exactly one correct answer.`
          );
        }

        if (
          !question.options.includes(
            question.correctAnswer[0]
          )
        ) {
          throw new Error(
            `Question ${number} has an invalid correct answer.`
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | MCQ MULTIPLE
      |--------------------------------------------------------------------------
      */

      if (
        question.type ===
        "MCQ_MULTIPLE"
      ) {
        if (
          question.options.length <
          4
        ) {
          throw new Error(
            `Question ${number} needs at least 4 options.`
          );
        }

        if (
          question.correctAnswer
            .length < 2
        ) {
          throw new Error(
            `Question ${number} must have at least two correct answers.`
          );
        }

        const invalidAnswer =
          question.correctAnswer.find(
            (answer) =>
              !question.options.includes(
                answer
              )
          );

        if (
          invalidAnswer
        ) {
          throw new Error(
            `Question ${number} has an invalid correct answer.`
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | TRUE / FALSE
      |--------------------------------------------------------------------------
      */

      if (
        question.type ===
        "TRUE_FALSE"
      ) {
        if (
          question.options.length !==
            2 ||
          question.options[0] !==
            "true" ||
          question.options[1] !==
            "false"
        ) {
          throw new Error(
            `Question ${number} has invalid TRUE/FALSE options.`
          );
        }

        if (
          question.correctAnswer
            .length !== 1
        ) {
          throw new Error(
            `Question ${number} must have exactly one TRUE/FALSE answer.`
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
            `Question ${number} has an invalid TRUE/FALSE answer.`
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | THEORY
      |--------------------------------------------------------------------------
      */

      if (
        question.type ===
        "THEORY"
      ) {
        if (
          question.options.length !==
          0
        ) {
          throw new Error(
            `Theory question ${number} must not have options.`
          );
        }

        if (
          question.correctAnswer
            .length !== 0
        ) {
          throw new Error(
            `Theory question ${number} must not have correctAnswer.`
          );
        }

        if (
          !question.expectedAnswer
        ) {
          throw new Error(
            `Theory question ${number} is missing expectedAnswer.`
          );
        }

        if (
          question.evaluationCriteria
            .length === 0
        ) {
          throw new Error(
            `Theory question ${number} is missing evaluationCriteria.`
          );
        }
      }
    }
  );

  return true;
};

/*
|--------------------------------------------------------------------------
| Normalize Generated Questions
|--------------------------------------------------------------------------
*/

const normalizeGeneratedQuestions = (
  parsedQuestions,
  {
    category,
    topicList,
    difficulty,
    selectedTypes,
    negativeMarking,
    finalNegativeMarks,
  }
) => {
  return parsedQuestions.map(
    (
      question,
      index
    ) => {
      /*
      |--------------------------------------------------------------------------
      | Question Type
      |--------------------------------------------------------------------------
      */

      let type =
        String(
          question.type || ""
        )
          .trim()
          .toUpperCase();

      /*
      |--------------------------------------------------------------------------
      | Only allow selected types
      |--------------------------------------------------------------------------
      */

      if (
        !selectedTypes.includes(
          type
        )
      ) {
        type =
          selectedTypes[
            index %
              selectedTypes.length
          ];
      }

      /*
      |--------------------------------------------------------------------------
      | Options
      |--------------------------------------------------------------------------
      */

      let options =
        Array.isArray(
          question.options
        )
          ? question.options
              .map((option) =>
                String(
                  option
                ).trim()
              )
              .filter(Boolean)
          : [];

      /*
      |--------------------------------------------------------------------------
      | Correct answer
      |--------------------------------------------------------------------------
      */

      let correctAnswer =
        Array.isArray(
          question.correctAnswer
        )
          ? question.correctAnswer
              .map((answer) =>
                String(
                  answer
                ).trim()
              )
              .filter(Boolean)
          : [];

      /*
      |--------------------------------------------------------------------------
      | TRUE / FALSE
      |--------------------------------------------------------------------------
      */

      if (
        type ===
        "TRUE_FALSE"
      ) {
        options = [
          "true",
          "false",
        ];

        correctAnswer =
          normalizeTrueFalseAnswer(
            question
          );

        console.log(
          `TRUE/FALSE Question ${index + 1}:`,
          correctAnswer
        );
      }

      /*
      |--------------------------------------------------------------------------
      | THEORY
      |--------------------------------------------------------------------------
      */

      if (
        type ===
        "THEORY"
      ) {
        options = [];
        correctAnswer = [];
      }

      /*
      |--------------------------------------------------------------------------
      | Expected answer
      |--------------------------------------------------------------------------
      */

      const expectedAnswer =
        String(
          question.expectedAnswer ||
            ""
        ).trim();

      /*
      |--------------------------------------------------------------------------
      | Evaluation criteria
      |--------------------------------------------------------------------------
      */

      const evaluationCriteria =
        Array.isArray(
          question.evaluationCriteria
        )
          ? question.evaluationCriteria
              .map((item) =>
                String(
                  item
                ).trim()
              )
              .filter(Boolean)
          : [];

      /*
      |--------------------------------------------------------------------------
      | Marks
      |--------------------------------------------------------------------------
      */

      const marks =
        Number(
          question.marks
        ) > 0
          ? Number(
              question.marks
            )
          : 2;

      /*
      |--------------------------------------------------------------------------
      | Negative marks
      |--------------------------------------------------------------------------
      */

      const questionNegativeMarks =
        negativeMarking
          ? Math.max(
              0,
              Number(
                question.negativeMarks
              ) ||
                finalNegativeMarks
            )
          : 0;

      /*
      |--------------------------------------------------------------------------
      | Difficulty
      |--------------------------------------------------------------------------
      */

      const allowedDifficulties = [
        "Easy",
        "Medium",
        "Hard",
        "Mixed",
      ];

      const questionDifficulty =
        allowedDifficulties.includes(
          question.difficulty
        )
          ? question.difficulty
          : difficulty;

      /*
      |--------------------------------------------------------------------------
      | Topics
      |--------------------------------------------------------------------------
      */

      const questionTopics =
        Array.isArray(
          question.topics
        )
          ? question.topics
              .map((topic) =>
                String(
                  topic
                ).trim()
              )
              .filter(Boolean)
          : topicList;

      /*
      |--------------------------------------------------------------------------
      | Tags
      |--------------------------------------------------------------------------
      */

      const tags =
        Array.isArray(
          question.tags
        )
          ? question.tags
              .map((tag) =>
                String(
                  tag
                ).trim()
              )
              .filter(Boolean)
          : [];

      /*
      |--------------------------------------------------------------------------
      | Explanation
      |--------------------------------------------------------------------------
      */

      const explanation =
        String(
          question.explanation ||
            ""
        ).trim();

      return {
        questionNumber:
          index + 1,

        type,

        question:
          String(
            question.question ||
              ""
          ).trim(),

        options,

        correctAnswer,

        expectedAnswer,

        evaluationCriteria,

        marks,

        negativeMarks:
          questionNegativeMarks,

        difficulty:
          questionDifficulty,

        category,

        topics:
          questionTopics,

        tags,

        explanation,

        isActive: true,
      };
    }
  );
};

/*
|--------------------------------------------------------------------------
| Generate AI Mock Test Questions
|--------------------------------------------------------------------------
*/

const generateMockTestQuestions =
  async ({
    category,
    topics = [],
    difficulty = "Medium",
    questionCount = 20,
    questionTypes = [
      "MCQ_SINGLE",
    ],
    negativeMarking = false,
    negativeMarks = 0,
  }) => {
    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

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

    const allowedTypes = [
      "MCQ_SINGLE",
      "MCQ_MULTIPLE",
      "TRUE_FALSE",
      "THEORY",
    ];

    const selectedTypes =
      Array.isArray(
        questionTypes
      )
        ? questionTypes.filter(
            (type) =>
              allowedTypes.includes(
                type
              )
          )
        : [];

    if (
      selectedTypes.length === 0
    ) {
      throw new Error(
        "At least one valid question type is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Topics
    |--------------------------------------------------------------------------
    */

    const topicList =
      Array.isArray(topics)
        ? topics
            .filter(Boolean)
            .map((topic) =>
              String(topic).trim()
            )
            .filter(Boolean)
        : [];

    const topicText =
      topicList.length > 0
        ? topicList.join(", ")
        : category;

    /*
    |--------------------------------------------------------------------------
    | Difficulty
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Negative marking
    |--------------------------------------------------------------------------
    */

    const finalNegativeMarks =
      negativeMarking
        ? Math.max(
            0,
            Number(
              negativeMarks
            ) || 0
          )
        : 0;

    console.log(
      "\n========================================"
    );

    console.log(
      "🤖 AI MOCK TEST GENERATION"
    );

    console.log(
      "Category:",
      category
    );

    console.log(
      "Topics:",
      topicList
    );

    console.log(
      "Difficulty:",
      finalDifficulty
    );

    console.log(
      "Questions:",
      count
    );

    console.log(
      "Question Types:",
      selectedTypes
    );

    console.log(
      "========================================\n"
    );

    /*
    |--------------------------------------------------------------------------
    | Prompt
    |--------------------------------------------------------------------------
    */

    const prompt = `
You are an expert technical assessment generator for PrepPulse.

Generate a realistic placement mock test.

CATEGORY:
${category}

TOPICS:
${topicText}

DIFFICULTY:
${finalDifficulty}

QUESTION COUNT:
${count}

ALLOWED TYPES:
${selectedTypes.join(", ")}

NEGATIVE MARKING:
${
  negativeMarking
    ? "Enabled"
    : "Disabled"
}

NEGATIVE MARKS:
${finalNegativeMarks}

STRICT RULES:

1. Generate EXACTLY ${count} questions.

2. Use ONLY these question types:
${selectedTypes.join(", ")}

3. Do not duplicate questions.

4. Questions must be relevant to ${category}.

5. Questions must focus on:
${topicText}

6. Make questions appropriate for placement preparation.

7. Make every correct answer factually correct.

8. MCQ_SINGLE:
- minimum 4 options
- exactly one correctAnswer
- correctAnswer MUST exactly match one option

9. MCQ_MULTIPLE:
- minimum 4 options
- minimum two correctAnswer values
- every correctAnswer MUST exactly match an option

10. TRUE_FALSE:

IMPORTANT:

Every TRUE_FALSE question MUST have:

"options": ["true", "false"]

and exactly one:

"correctAnswer": ["true"]

OR

"correctAnswer": ["false"]

Never return:

"correctAnswer": []

Never return:

"correctAnswer": ["True/False"]

Never return:

"correctAnswer": ["Option A"]

Never omit correctAnswer.

11. THEORY:
- options = []
- correctAnswer = []
- expectedAnswer = model answer
- evaluationCriteria = array of important points

12. MCQ questions:
- expectedAnswer = ""
- evaluationCriteria = []

13. Every question needs an explanation.

14. Return ONLY JSON.

15. Do not use Markdown.

16. Do not add text before or after JSON.

RETURN:

{
  "questions": [
    {
      "questionNumber": 1,
      "type": "MCQ_SINGLE",
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": [
        "Option A"
      ],
      "expectedAnswer": "",
      "evaluationCriteria": [],
      "marks": 2,
      "negativeMarks": ${finalNegativeMarks},
      "difficulty": "${finalDifficulty}",
      "category": "${category}",
      "topics": ["topic"],
      "tags": ["tag"],
      "explanation": "Explanation"
    }
  ]
}
`;

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT:
    |
    | Validate EACH model response.
    |
    | If one model produces invalid TRUE/FALSE,
    | automatically try the next model.
    |--------------------------------------------------------------------------
    */

    let lastError = null;

    for (
      const modelName of MOCK_TEST_MODELS
    ) {
      try {
        console.log(
          `\n🔄 Trying model: ${modelName}`
        );

        /*
        |--------------------------------------------------------------------------
        | Gemini call
        |--------------------------------------------------------------------------
        */

        const response =
          await generateWithRetry(
            modelName,
            prompt,
            2
          );

        /*
        |--------------------------------------------------------------------------
        | Parse
        |--------------------------------------------------------------------------
        */

        const parsed =
          cleanGeminiJSON(
            response
          );

        /*
        |--------------------------------------------------------------------------
        | Normalize
        |--------------------------------------------------------------------------
        */

        const questions =
          normalizeGeneratedQuestions(
            parsed.questions,
            {
              category,
              topicList,
              difficulty:
                finalDifficulty,
              selectedTypes,
              negativeMarking,
              finalNegativeMarks,
            }
          );

        /*
        |--------------------------------------------------------------------------
        | Validate
        |--------------------------------------------------------------------------
        */

        validateGeneratedQuestions(
          questions,
          count
        );

        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        console.log(
          "\n========================================"
        );

        console.log(
          "✅ AI MOCK TEST GENERATED"
        );

        console.log(
          "Model:",
          modelName
        );

        console.log(
          "Questions:",
          questions.length
        );

        console.log(
          "========================================\n"
        );

        return {
          questions,
        };

      } catch (error) {
        lastError = error;

        console.error(
          `❌ Model ${modelName} failed`
        );

        console.error(
          "Reason:",
          error?.message
        );

        /*
        |--------------------------------------------------------------------------
        | VERY IMPORTANT
        |--------------------------------------------------------------------------
        |
        | Continue with next Gemini model.
        |
        */

        continue;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | All models failed
    |--------------------------------------------------------------------------
    */

    console.error(
      "\n========================================"
    );

    console.error(
      "❌ ALL GEMINI MODELS FAILED"
    );

    console.error(
      lastError?.message
    );

    console.error(
      "========================================\n"
    );

    throw (
      lastError ||
      new Error(
        "Unable to generate mock test."
      )
    );
  };

/*
|--------------------------------------------------------------------------
| Resume Analysis
|--------------------------------------------------------------------------
*/

const analyzeResume = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
    });

    const prompt = `
You are an expert ATS resume analyzer and technical recruiter.

Analyze the resume below based ONLY on the actual information present in the resume.

Do not invent skills.
Do not invent companies.
Do not invent projects.
Do not invent experience.
Do not invent certifications.
Do not invent education.
Do not assume missing information exists.

Your task is to evaluate the resume for modern ATS systems and entry-level software/technical roles.

Return ONLY valid JSON.

Required JSON structure:

{
  "score": 0,
  "metrics": {
    "keywordRelevance": 0,
    "skillsMatch": 0,
    "formatting": 0,
    "actionVerbImpact": 0,
    "experienceRelevance": 0,
    "projectRelevance": 0
  },
  "skills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "atsIssues": [],
  "executiveSummary": "",
  "analysis": ""
}

SCORING RULES:

score:
Overall ATS compatibility score from 0 to 100.

keywordRelevance:
Evaluate the presence and relevance of technical/job-related keywords.

skillsMatch:
Evaluate the technical skills explicitly present in the resume.

formatting:
Evaluate structure, readability, consistency, section organization and ATS friendliness based on the extracted text.

actionVerbImpact:
Evaluate the use of strong action verbs in project and experience descriptions.

experienceRelevance:
Evaluate relevance and quality of internships, experience and responsibilities actually mentioned.

projectRelevance:
Evaluate technical project relevance, technologies used, responsibilities and outcomes.

IMPORTANT:

Every score must be an integer between 0 and 100.

skills:
Return only skills explicitly detected in the resume.

missingSkills:
Return useful skills that appear to be missing for the candidate's apparent technical direction, but do not claim they are required unless reasonably supported by the resume context.

strengths:
Return actual strengths visible from the resume.

weaknesses:
Return actual weaknesses or gaps visible from the resume.

suggestions:
Return specific actionable improvements.

atsIssues:
Return actual ATS-related problems detected from the resume text.

executiveSummary:
Write a concise professional summary of the resume quality.

analysis:
Write a detailed but concise explanation of the evaluation.

Do not return Markdown.

RESUME:

${resumeText}
`;

    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      throw new Error("Gemini returned an empty response.");
    }

    const text = result.response.text();

    if (!text) {
      throw new Error("Gemini returned empty analysis.");
    }

    const parsed = cleanGeminiJSON(text);

    const metrics = parsed.metrics || {};

    return {
      score: Math.min(
        100,
        Math.max(0, Number(parsed.score) || 0)
      ),

      metrics: {
        keywordRelevance: Math.min(
          100,
          Math.max(
            0,
            Number(metrics.keywordRelevance) || 0
          )
        ),

        skillsMatch: Math.min(
          100,
          Math.max(
            0,
            Number(metrics.skillsMatch) || 0
          )
        ),

        formatting: Math.min(
          100,
          Math.max(
            0,
            Number(metrics.formatting) || 0
          )
        ),

        actionVerbImpact: Math.min(
          100,
          Math.max(
            0,
            Number(metrics.actionVerbImpact) || 0
          )
        ),

        experienceRelevance: Math.min(
          100,
          Math.max(
            0,
            Number(metrics.experienceRelevance) || 0
          )
        ),

        projectRelevance: Math.min(
          100,
          Math.max(
            0,
            Number(metrics.projectRelevance) || 0
          )
        ),
      },

      skills: Array.isArray(parsed.skills)
        ? parsed.skills
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],

      missingSkills: Array.isArray(
        parsed.missingSkills
      )
        ? parsed.missingSkills
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],

      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],

      weaknesses: Array.isArray(parsed.weaknesses)
        ? parsed.weaknesses
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],

      suggestions: Array.isArray(
        parsed.suggestions
      )
        ? parsed.suggestions
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],

      atsIssues: Array.isArray(parsed.atsIssues)
        ? parsed.atsIssues
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [],

      executiveSummary:
        String(
          parsed.executiveSummary || ""
        ).trim(),

      analysis:
        String(
          parsed.analysis || ""
        ).trim(),
    };
  } catch (error) {
    console.error(
      "Resume AI Error:",
      error
    );

    throw new Error(
      error?.message ||
        "Resume analysis failed."
    );
  }
};

/*
|--------------------------------------------------------------------------
| Generate Interview Questions
|--------------------------------------------------------------------------
*/

const generateInterviewQuestions =
  async (role) => {
    try {
      const model =
        genAI.getGenerativeModel({
          model: GEMINI_MODEL,
        });

      const prompt = `
Generate exactly 5 interview questions
for a ${role} fresher.

Return ONLY JSON.

{
  "questions": [
    "question1",
    "question2",
    "question3",
    "question4",
    "question5"
  ]
}
`;

      const result =
        await model.generateContent(
          prompt
        );

      return cleanGeminiJSON(
        result.response.text()
      );

    } catch (error) {
      console.error(
        "Interview Question AI Error:",
        error
      );

      return {
        questions: [
          "Explain OOP concepts.",
          "What is JVM?",
          "Difference between ArrayList and LinkedList?",
          "What is REST API?",
          "What is SQL Join?",
        ],
      };
    }
  };

/*
|--------------------------------------------------------------------------
| Evaluate Interview Answers
|--------------------------------------------------------------------------
*/

const evaluateInterviewAnswers =
  async (
    questions,
    answers
  ) => {
    try {
      const model =
        genAI.getGenerativeModel({
          model: GEMINI_MODEL,
        });

      const prompt = `
You are an expert technical interviewer.

Evaluate the candidate.

Questions:

${JSON.stringify(
  questions
)}

Answers:

${JSON.stringify(
  answers
)}

Return ONLY JSON.

{
  "score": 0,
  "feedback": ""
}

Score must be between 0 and 100.
`;

      const result =
        await model.generateContent(
          prompt
        );

      return cleanGeminiJSON(
        result.response.text()
      );

    } catch (error) {
      console.error(
        "Interview Evaluation AI Error:",
        error
      );

      return {
        score: 75,
        feedback:
          "Good attempt. Improve technical depth.",
      };
    }
  };

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  analyzeResume,
  generateInterviewQuestions,
  evaluateInterviewAnswers,
  generateMockTestQuestions,
};