const Note = require("../models/Notes");

const {
  notifyNotesGenerated,
  notifyNoteSaved,
} = require("../services/notificationService");

const { GoogleGenAI } = require("@google/genai");

/* ============================================================
   GEMINI CONFIGURATION
============================================================ */

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "⚠️ GEMINI_API_KEY / GOOGLE_API_KEY is not configured."
  );
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

/* ============================================================
   GEMINI MODEL FALLBACK CHAIN
============================================================ */

const PRIMARY_GEMINI_MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.8-flash";

const FALLBACK_GEMINI_MODELS = (
  process.env.GEMINI_FALLBACK_MODELS ||
  "gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash-lite"
)
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const GEMINI_MODELS = [
  PRIMARY_GEMINI_MODEL,
  ...FALLBACK_GEMINI_MODELS,
].filter(
  (model, index, array) =>
    array.indexOf(model) === index
);

console.log(
  "[Notes Gemini] Available models:",
  GEMINI_MODELS
);

/* ============================================================
   HELPERS
============================================================ */

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

/*
============================================================
GET USER ID
============================================================
*/

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

/*
============================================================
CHECK RETRYABLE GEMINI ERROR
============================================================
*/

const isRetryableGeminiError = (
  error
) => {
  const status =
    Number(error?.status) ||
    Number(error?.code) ||
    Number(error?.response?.status);

  const message = String(
    error?.message || ""
  ).toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("temporarily") ||
    message.includes("overloaded") ||
    message.includes("capacity")
  );
};

/*
============================================================
CLEAN GEMINI ERROR MESSAGE
============================================================
*/

const getCleanGeminiErrorMessage = (
  error
) => {
  if (!error) {
    return "Gemini AI generation failed.";
  }

  const rawMessage = String(
    error?.message || ""
  );

  /*
  Direct JSON
  */

  try {
    const parsed =
      JSON.parse(rawMessage);

    if (parsed?.error?.message) {
      return parsed.error.message;
    }

    if (parsed?.message) {
      return parsed.message;
    }
  } catch {
    // Not JSON
  }

  /*
  Nested JSON
  */

  const jsonStart =
    rawMessage.indexOf('{"error"');

  if (jsonStart !== -1) {
    try {
      const parsed =
        JSON.parse(
          rawMessage.slice(jsonStart)
        );

      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    } catch {
      // Ignore
    }
  }

  return (
    rawMessage ||
    "Gemini AI generation failed."
  );
};

/* ============================================================
   GEMINI GENERATION WITH AUTOMATIC FALLBACK
============================================================ */

const generateWithGeminiFallback =
  async (prompt) => {
    let lastError = null;

    for (
      let index = 0;
      index < GEMINI_MODELS.length;
      index++
    ) {
      const model =
        GEMINI_MODELS[index];

      try {
        console.log(
          `[Notes Gemini] Trying model: ${model}`
        );

        const response =
          await ai.models.generateContent({
            model,
            contents: prompt,
          });

        const text =
          response?.text?.trim() ||
          "";

        if (!text) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        console.log(
          `[Notes Gemini] Success with model: ${model}`
        );

        return {
          text,
          model,
        };
      } catch (error) {
        lastError = error;

        const retryable =
          isRetryableGeminiError(
            error
          );

        console.error(
          `[Notes Gemini] Model failed: ${model}`,
          {
            status:
              error?.status ||
              error?.code,

            retryable,

            message:
              getCleanGeminiErrorMessage(
                error
              ),
          }
        );

        /*
        Non-retryable error
        */

        if (!retryable) {
          throw error;
        }

        /*
        Retry primary model once
        */

        if (index === 0) {
          console.log(
            `[Notes Gemini] Retrying ${model}...`
          );

          await sleep(1500);

          try {
            const retryResponse =
              await ai.models.generateContent({
                model,
                contents: prompt,
              });

            const retryText =
              retryResponse?.text?.trim() ||
              "";

            if (!retryText) {
              throw new Error(
                "Gemini returned an empty response after retry."
              );
            }

            console.log(
              `[Notes Gemini] Retry succeeded: ${model}`
            );

            return {
              text: retryText,
              model,
            };
          } catch (retryError) {
            lastError =
              retryError;

            console.error(
              `[Notes Gemini] Retry failed: ${model}`,
              getCleanGeminiErrorMessage(
                retryError
              )
            );
          }
        }

        /*
        Move to fallback model
        */

        if (
          index <
          GEMINI_MODELS.length - 1
        ) {
          const nextModel =
            GEMINI_MODELS[index + 1];

          console.log(
            `[Notes Gemini] Falling back from ${model} to ${nextModel}`
          );

          await sleep(700);
        }
      }
    }

    throw (
      lastError ||
      new Error(
        "All Gemini models are currently unavailable."
      )
    );
  };

/* ============================================================
   SAVE NOTE
   POST /api/notes/save
============================================================ */

exports.saveNote = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const {
      title,
      content,
      subject,
      tags,
    } = req.body || {};

    /*
    Validate title
    */

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Note title is required.",
      });
    }

    /*
    Validate content
    */

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Note content is required.",
      });
    }

    /*
    Create note
    */

    const note =
      await Note.create({
        userId,

        title: title.trim(),

        content: content.trim(),

        subject:
          subject?.trim() || "",

        tags: Array.isArray(tags)
          ? tags
              .map((tag) =>
                String(tag).trim()
              )
              .filter(Boolean)
          : [],
      });

    /*
    ========================================================
    NOTIFICATION
    ========================================================

    Important:
    The note is created first.

    Only after successful database save,
    create the notification.
    */

    await notifyNoteSaved({
      userId,
      title:
        note.title ||
        "Study Note",
    });

    /*
    Response
    */

    return res.status(201).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error(
      "Save Note Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save note.",
    });
  }
};

/* ============================================================
   GET ALL NOTES
   GET /api/notes
============================================================ */

exports.getNotes = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const notes =
      await Note.find({
        userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error(
      "Get Notes Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notes.",
    });
  }
};

/* ============================================================
   GET SINGLE NOTE
   GET /api/notes/:id
============================================================ */

exports.getNoteById =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const note =
        await Note.findOne({
          _id: req.params.id,
          userId,
        }).lean();

      if (!note) {
        return res.status(404).json({
          success: false,
          message:
            "Note not found.",
        });
      }

      return res.status(200).json({
        success: true,
        note,
      });
    } catch (error) {
      console.error(
        "Get Note Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch note.",
      });
    }
  };

/* ============================================================
   DELETE NOTE
   DELETE /api/notes/:id
============================================================ */

exports.deleteNote =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const note =
        await Note.findOneAndDelete({
          _id: req.params.id,
          userId,
        });

      if (!note) {
        return res.status(404).json({
          success: false,
          message:
            "Note not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Note deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Note Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete note.",
      });
    }
  };

/* ============================================================
   GENERATE AI NOTES
   POST /api/notes/generate
============================================================ */

exports.generateNotes =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const {
        topic,
      } = req.body || {};

      /*
      ========================================================
      VALIDATION
      ========================================================
      */

      if (!topic?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Topic is required.",
        });
      }

      const cleanTopic =
        topic.trim();

      console.log(
        `[Notes] Generating notes for topic: ${cleanTopic}`
      );

      /*
      ========================================================
      PROMPT
      ========================================================
      */

      const prompt = `
You are PrepPulse AI, an advanced AI study assistant.

Generate detailed, accurate, student-friendly study notes for:

"${cleanTopic}"

IMPORTANT RULES:

1. Explain the topic clearly.
2. Use simple English.
3. Structure the answer for exam preparation.
4. Do not invent facts.
5. Avoid unnecessary repetition.
6. Include practical examples where useful.
7. Include interview-focused points.
8. Make the notes useful for both learning and revision.

Use exactly this structure:

# ${cleanTopic}

## 1. Introduction

Explain the topic briefly and clearly.

## 2. Definition

Give the important definition.

## 3. Key Concepts

Explain the major concepts.

## 4. Important Points

List the most important points students should remember.

## 5. Advantages

Explain important advantages where applicable.

## 6. Disadvantages

Explain important disadvantages or limitations where applicable.

## 7. Real-World Examples

Give relevant examples.

## 8. Practical Understanding

Explain how the concept is used in real situations.

## 9. Interview Questions

Provide important interview questions with short answers.

## 10. Quick Revision

Give concise revision points.

## 11. Summary

Give a final summary.

Return ONLY the study notes in Markdown.
`;

      /*
      ========================================================
      GEMINI
      ========================================================
      */

      const {
        text: notes,
        model,
      } =
        await generateWithGeminiFallback(
          prompt
        );

      /*
      ========================================================
      NOTIFICATION
      ========================================================

      Send notification only after Gemini
      successfully generated the notes.
      */

      await notifyNotesGenerated({
        userId,
        title: cleanTopic,
      });

      /*
      ========================================================
      RESPONSE
      ========================================================
      */

      return res.status(200).json({
        success: true,
        notes,
        model,
      });
    } catch (error) {
      console.error(
        "Generate Notes Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          getCleanGeminiErrorMessage(
            error
          ),
      });
    }
  };