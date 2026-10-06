const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const apiKey =
  process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured."
  );
}

const genAI =
  new GoogleGenerativeAI(apiKey);

const PRIMARY_MODEL =
  process.env.GEMINI_RESUME_MODEL ||
  "gemini-3.5-flash-lite";

const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
];

const RETRYABLE_STATUS_CODES = [
  429,
  500,
  502,
  503,
  504,
];

const MAX_RETRIES = 2;

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

const getErrorStatus = (error) => {
  return (
    error?.status ||
    error?.response?.status ||
    error?.errorDetails?.status ||
    null
  );
};

const isRetryableError = (error) => {
  const status =
    getErrorStatus(error);

  if (
    RETRYABLE_STATUS_CODES.includes(
      status
    )
  ) {
    return true;
  }

  const message =
    String(
      error?.message || ""
    ).toLowerCase();

  return (
    message.includes(
      "high demand"
    ) ||
    message.includes(
      "temporarily unavailable"
    ) ||
    message.includes(
      "service unavailable"
    ) ||
    message.includes(
      "unavailable"
    ) ||
    message.includes(
      "overloaded"
    ) ||
    message.includes(
      "rate limit"
    )
  );
};

const getRetryDelay = (
  retryNumber
) => {
  const baseDelay = 2500;

  const exponentialDelay =
    baseDelay *
    Math.pow(
      2,
      retryNumber
    );

  const jitter =
    Math.floor(
      Math.random() * 1000
    );

  return (
    exponentialDelay +
    jitter
  );
};

const cleanJsonResponse = (
  text
) => {
  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  let cleaned =
    String(text).trim();

  if (
    cleaned.startsWith(
      "```json"
    )
  ) {
    cleaned = cleaned
      .replace(
        /^```json\s*/i,
        ""
      )
      .replace(
        /\s*```$/,
        ""
      );
  } else if (
    cleaned.startsWith(
      "```"
    )
  ) {
    cleaned = cleaned
      .replace(
        /^```\s*/i,
        ""
      )
      .replace(
        /\s*```$/,
        ""
      );
  }

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned =
      cleaned.substring(
        firstBrace,
        lastBrace + 1
      );
  }

  try {
    return JSON.parse(
      cleaned
    );
  } catch (error) {
    console.error(
      "Gemini JSON Parse Error:",
      cleaned
    );

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }
};

const normalizeArray = (
  value
) => {
  if (
    Array.isArray(value)
  ) {
    return value
      .filter(
        (item) =>
          item !== null &&
          item !== undefined
      )
      .map((item) =>
        typeof item ===
        "string"
          ? item.trim()
          : String(item)
      )
      .filter(Boolean);
  }

  return [];
};

const normalizeNumber = (
  value
) => {
  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      number
    )
  );
};

const normalizeMetrics = (
  metrics
) => {
  return {
    keywordRelevance:
      normalizeNumber(
        metrics
          ?.keywordRelevance
      ),

    formatting:
      normalizeNumber(
        metrics?.formatting
      ),

    impact:
      normalizeNumber(
        metrics?.impact
      ),

    completeness:
      normalizeNumber(
        metrics?.completeness
      ),
  };
};

const normalizeResult = (
  result
) => {
  return {
    score:
      normalizeNumber(
        result?.score
      ),

    metrics:
      normalizeMetrics(
        result?.metrics
      ),

    skills:
      normalizeArray(
        result?.skills
      ),

    missingSkills:
      normalizeArray(
        result?.missingSkills
      ),

    strengths:
      normalizeArray(
        result?.strengths
      ),

    weaknesses:
      normalizeArray(
        result?.weaknesses
      ),

    suggestions:
      normalizeArray(
        result?.suggestions
      ),

    atsIssues:
      normalizeArray(
        result?.atsIssues
      ),

    executiveSummary:
      typeof result
        ?.executiveSummary ===
      "string"
        ? result.executiveSummary
        : "",

    analysis:
      typeof result
        ?.analysis ===
      "string"
        ? result.analysis
        : "",
  };
};

const buildPrompt = (
  resumeText
) => {
  return `
You are an expert ATS resume analyzer, technical recruiter, and career advisor.

Analyze the resume below carefully.

Your response MUST contain ONLY valid JSON.
Do not use Markdown.
Do not wrap the JSON in code fences.
Do not add explanations before or after the JSON.

Use exactly this structure:

{
  "score": 0,
  "metrics": {
    "keywordRelevance": 0,
    "formatting": 0,
    "impact": 0,
    "completeness": 0
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

Rules:

1. score must be between 0 and 100.

2. metrics.keywordRelevance must be between 0 and 100.

3. metrics.formatting must be between 0 and 100.

4. metrics.impact must be between 0 and 100.

5. metrics.completeness must be between 0 and 100.

6. Only include skills that are actually present in the resume.

7. missingSkills should contain useful skills or areas that are missing or insufficient based on the resume.

8. strengths must be based only on information actually present in the resume.

9. weaknesses must be based only on information actually present in the resume.

10. suggestions must be practical and actionable.

11. atsIssues should identify genuine ATS-related problems such as:
   - missing keywords
   - weak section structure
   - poor bullet points
   - lack of measurable achievements
   - formatting problems
   - missing contact information
   - inconsistent terminology
   - weak job-title alignment

12. executiveSummary should be a concise professional assessment.

13. analysis should provide a useful overall explanation of the resume quality.

14. Never invent:
   - companies
   - projects
   - certifications
   - degrees
   - experience
   - technologies
   - achievements

15. If information is not present, do not assume it.

RESUME:

${resumeText}
`;
};

const generateWithModel = async (
  modelName,
  prompt
) => {
  const model =
    genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType:
          "application/json",
      },
    });

  let lastError = null;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      console.log(
        `Resume AI: ${modelName} attempt ${
          attempt + 1
        }/${MAX_RETRIES + 1}`
      );

      const result =
        await model.generateContent(
          prompt
        );

      const response =
        result.response;

      const text =
        response.text();

      return cleanJsonResponse(
        text
      );
    } catch (error) {
      lastError = error;

      const status =
        getErrorStatus(error);

      console.error(
        `Resume AI error from ${modelName}:`,
        {
          status,
          message:
            error?.message,
        }
      );

      if (
        !isRetryableError(error)
      ) {
        throw error;
      }

      if (
        attempt >=
        MAX_RETRIES
      ) {
        break;
      }

      const delay =
        getRetryDelay(
          attempt
        );

      console.log(
        `Retrying ${modelName} in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};

const analyzeResume = async (
  resumeText
) => {
  if (
    !resumeText ||
    !resumeText.trim()
  ) {
    throw new Error(
      "Resume text is empty."
    );
  }

  const prompt =
    buildPrompt(
      resumeText
    );

  const models = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS,
  ].filter(
    (model, index, array) =>
      array.indexOf(model) ===
      index
  );

  let lastError = null;

  for (
    const modelName of models
  ) {
    try {
      console.log(
        `Resume AI: trying model ${modelName}`
      );

      const rawResult =
        await generateWithModel(
          modelName,
          prompt
        );

      const normalized =
        normalizeResult(
          rawResult
        );

      console.log(
        `Resume AI: ${modelName} succeeded`
      );

      return normalized;
    } catch (error) {
      lastError = error;

      console.error(
        `Resume AI model ${modelName} failed:`,
        error?.message
      );

      const status =
        getErrorStatus(error);

      if (
        !isRetryableError(error)
      ) {
        throw error;
      }

      console.log(
        `Resume AI: switching from ${modelName} to fallback model`
      );
    }
  }

  throw new Error(
    lastError?.message ||
      "All Resume AI models are temporarily unavailable. Please try again."
  );
};

module.exports = {
  analyzeResume,
};