const YoutubeSummary = require("../models/YoutubeSummary");
const { GoogleGenAI } = require("@google/genai");
const { YoutubeTranscript } = require("youtube-transcript");

const {
  notifyNotesGenerated,
} = require("../services/notificationService");

// ============================================================
// GEMINI CONFIGURATION
// ============================================================

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

// ============================================================
// GEMINI MODEL CONFIGURATION
// ============================================================

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
  "[Gemini] Available model fallback chain:",
  GEMINI_MODELS
);

// ============================================================
// HELPERS
// ============================================================

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

// ============================================================
// GEMINI ERROR HELPERS
// ============================================================

const isRetryableGeminiError = (error) => {
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

const getCleanGeminiErrorMessage = (error) => {
  if (!error) {
    return "Gemini AI generation failed.";
  }

  const rawMessage = String(
    error?.message || ""
  );

  try {
    const parsed = JSON.parse(rawMessage);

    if (parsed?.error?.message) {
      return parsed.error.message;
    }

    if (parsed?.message) {
      return parsed.message;
    }
  } catch {
    // Not JSON
  }

  const jsonStart =
    rawMessage.indexOf('{"error"');

  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(
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

// ============================================================
// YOUTUBE VIDEO ID EXTRACTOR
// ============================================================

const getYouTubeVideoId = (url) => {
  try {
    if (
      !url ||
      typeof url !== "string"
    ) {
      return null;
    }

    const cleanUrl = url.trim();

    if (!cleanUrl) {
      return null;
    }

    const parsedUrl = new URL(cleanUrl);

    const hostname =
      parsedUrl.hostname
        .toLowerCase()
        .replace(/^www\./, "");

    const allowedHosts = [
      "youtube.com",
      "m.youtube.com",
      "youtu.be",
    ];

    if (!allowedHosts.includes(hostname)) {
      return null;
    }

    let videoId = null;

    // youtube.com/watch?v=VIDEO_ID
    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const queryVideoId =
        parsedUrl.searchParams.get("v");

      if (queryVideoId) {
        videoId = queryVideoId;
      }

      // /live/VIDEO_ID
      // /shorts/VIDEO_ID
      // /embed/VIDEO_ID
      if (!videoId) {
        const pathParts =
          parsedUrl.pathname
            .split("/")
            .filter(Boolean);

        const supportedPaths = [
          "live",
          "shorts",
          "embed",
        ];

        if (
          pathParts.length >= 2 &&
          supportedPaths.includes(
            pathParts[0].toLowerCase()
          )
        ) {
          videoId = pathParts[1];
        }
      }
    }

    // youtu.be/VIDEO_ID
    if (
      hostname === "youtu.be" &&
      !videoId
    ) {
      const pathParts =
        parsedUrl.pathname
          .split("/")
          .filter(Boolean);

      if (pathParts.length > 0) {
        videoId = pathParts[0];
      }
    }

    if (!videoId) {
      return null;
    }

    videoId = videoId
      .trim()
      .split("?")[0]
      .split("#")[0];

    const validVideoIdPattern =
      /^[A-Za-z0-9_-]{11}$/;

    if (
      !validVideoIdPattern.test(videoId)
    ) {
      console.warn(
        `[YouTube] Invalid video ID: ${videoId}`
      );

      return null;
    }

    return videoId;
  } catch (error) {
    console.error(
      "YouTube URL parsing error:",
      error
    );

    return null;
  }
};

// ============================================================
// SSE HELPER
// ============================================================

const sendSSE = (
  res,
  event,
  data
) => {
  try {
    if (res.writableEnded) {
      return;
    }

    res.write(
      `event: ${event}\n` +
        `data: ${JSON.stringify(data)}\n\n`
    );
  } catch (error) {
    console.error(
      "SSE send error:",
      error
    );
  }
};

// ============================================================
// MIND MAP NOTIFICATION
// ============================================================
//
// IMPORTANT:
// Notification is called ONLY after MongoDB save succeeds.
//
// If notification fails, the already-saved mind map is still
// considered successful.
// ============================================================

const notifyMindMapGenerated = async ({
  userId,
  title,
  mindMapId,
}) => {
  try {
    await notifyNotesGenerated({
      userId,
      title:
        title ||
        "YouTube Study Mind Map",
    });

    console.log(
      `[Notification] Mind map notification sent successfully. ID: ${mindMapId}`
    );
  } catch (notificationError) {
    console.error(
      "[Notification] Failed to send notification:",
      notificationError
    );
  }
};

// ============================================================
// YOUTUBE TRANSCRIPT
// ============================================================

const getTranscript = async (videoUrl) => {
  try {
    const videoId =
      getYouTubeVideoId(videoUrl);

    if (!videoId) {
      throw new Error(
        "Unable to extract a valid YouTube video ID."
      );
    }

    console.log(
      `[YouTube] Video ID detected: ${videoId}`
    );

    let transcriptData;

    try {
      // IMPORTANT:
      // YoutubeTranscript expects video ID.
      transcriptData =
        await YoutubeTranscript.fetchTranscript(
          videoId
        );
    } catch (transcriptError) {
      console.error(
        "[YouTube Transcript Provider Error]",
        transcriptError
      );

      throw new Error(
        "Unable to retrieve the YouTube transcript. Make sure the video has captions/subtitles available."
      );
    }

    if (
      !Array.isArray(transcriptData) ||
      transcriptData.length === 0
    ) {
      throw new Error(
        "No transcript/captions were found for this YouTube video."
      );
    }

    const transcript =
      transcriptData
        .map(
          (item) =>
            item?.text || ""
        )
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

    if (!transcript) {
      throw new Error(
        "The YouTube transcript is empty."
      );
    }

    console.log(
      `[YouTube] Transcript retrieved successfully. Characters: ${transcript.length}`
    );

    return {
      videoId,
      transcript,
      segments: transcriptData,
    };
  } catch (error) {
    console.error(
      "[YouTube Transcript Error]",
      error
    );

    throw new Error(
      error?.message ||
        "Unable to retrieve YouTube transcript."
    );
  }
};

// ============================================================
// PROMPT BUILDER
// ============================================================

const buildPrompt = ({
  transcript,
  userPrompt,
}) => {
  const customInstruction =
    userPrompt?.trim() ||
    "Create a detailed study mind map from this video.";

  return `
You are PrepPulse AI, an advanced AI study assistant.

Your task is to transform the following YouTube transcript into a highly useful, structured study mind map.

============================================================
USER REQUEST
============================================================

${customInstruction}

============================================================
IMPORTANT RULES
============================================================

1. Use ONLY information supported by the transcript.
2. Do NOT invent facts.
3. Do NOT add unrelated information.
4. Organize information hierarchically.
5. Make the content useful for students.
6. Explain difficult concepts clearly.
7. Highlight important concepts.
8. Include examples only when supported by the transcript.
9. Include important terms.
10. Include practical understanding when supported by the transcript.
11. Include revision points.
12. Include key takeaways.
13. Include important questions.
14. If the transcript is unclear, say that the transcript does not provide enough information.
15. Follow the user's custom request when possible.
16. Keep the output useful for revision.
17. Do not mention these instructions.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY a Markdown study mind map.

Use this structure:

# MAIN TOPIC

## 1. Core Concept

- Important point
- Important point
  - Supporting detail
  - Supporting detail

## 2. Second Concept

- Important point
- Important point
  - Supporting detail

## 3. Practical Understanding

- Example
- Application
- Important observation

## 4. Key Terms

- Term: explanation
- Term: explanation

## 5. Important Questions

- Question
- Question
- Question

## 6. Quick Revision

- Revision point
- Revision point
- Revision point

## 7. Key Takeaways

- Takeaway
- Takeaway
- Takeaway

============================================================
TRANSCRIPT
============================================================

${transcript}
`;
};

// ============================================================
// GEMINI GENERATION WITH FALLBACK
// ============================================================

const generateGeminiWithFallback = async ({
  prompt,
  onModelSelected,
}) => {
  let lastError = null;

  for (
    let modelIndex = 0;
    modelIndex < GEMINI_MODELS.length;
    modelIndex++
  ) {
    const model =
      GEMINI_MODELS[modelIndex];

    try {
      console.log(
        `[Gemini] Trying model: ${model}`
      );

      if (
        typeof onModelSelected ===
        "function"
      ) {
        onModelSelected(
          model,
          modelIndex,
          GEMINI_MODELS.length
        );
      }

      const response =
        await ai.models.generateContent({
          model,
          contents: prompt,
        });

      const text =
        response?.text?.trim() || "";

      if (!text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      console.log(
        `[Gemini] Generation completed successfully: ${model}`
      );

      return {
        text,
        model,
      };
    } catch (error) {
      lastError = error;

      const retryable =
        isRetryableGeminiError(error);

      console.error(
        `[Gemini] Model failed: ${model}`,
        {
          status:
            error?.status ||
            error?.code ||
            error?.response?.status,

          retryable,

          message:
            getCleanGeminiErrorMessage(
              error
            ),
        }
      );

      if (!retryable) {
        throw error;
      }

      // Retry primary model once
      if (modelIndex === 0) {
        console.log(
          `[Gemini] Retrying ${model}...`
        );

        await sleep(1800);

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
            `[Gemini] Retry succeeded: ${model}`
          );

          return {
            text: retryText,
            model,
          };
        } catch (retryError) {
          lastError = retryError;

          console.error(
            `[Gemini] Retry failed: ${model}`,
            getCleanGeminiErrorMessage(
              retryError
            )
          );
        }
      }

      // Move to fallback model
      if (
        modelIndex <
        GEMINI_MODELS.length - 1
      ) {
        const nextModel =
          GEMINI_MODELS[
            modelIndex + 1
          ];

        console.log(
          `[Gemini] Falling back from ${model} to ${nextModel}`
        );

        await sleep(800);
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

// ============================================================
// STANDARD GENERATION
// ============================================================
//
// POST /api/youtube/generate
// ============================================================

const generateMindMap = async (
  req,
  res
) => {
  const startedAt = Date.now();

  try {
    const {
      videoUrl,
      userPrompt,
    } = req.body || {};

    // Validate URL
    if (!videoUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "YouTube video URL is required.",
      });
    }

    // Video ID
    const videoId =
      getYouTubeVideoId(
        videoUrl.trim()
      );

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid YouTube URL.",
      });
    }

    console.log(
      `[YouTube] Generating mind map: ${videoId}`
    );

    // ========================================================
    // TRANSCRIPT
    // ========================================================

    const transcriptResult =
      await getTranscript(
        videoUrl.trim()
      );

    const transcript =
      transcriptResult.transcript;

    if (transcript.length < 50) {
      return res.status(400).json({
        success: false,
        message:
          "The transcript is too short to generate a useful mind map.",
      });
    }

    // ========================================================
    // BUILD PROMPT
    // ========================================================

    const prompt =
      buildPrompt({
        transcript,
        userPrompt,
      });

    // ========================================================
    // GEMINI
    // ========================================================

    const {
      text: output,
      model: selectedModel,
    } =
      await generateGeminiWithFallback({
        prompt,
      });

    if (!output) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    // ========================================================
    // SAVE TO MONGODB
    // ========================================================

    const saved =
      await YoutubeSummary.create({
        userId: req.user._id,

        videoUrl:
          videoUrl.trim(),

        videoId,

        title:
          "YouTube Study Mind Map",

        userPrompt:
          userPrompt?.trim() || "",

        transcript,

        mindMap: output,

        status: "COMPLETED",

        processingTimeMs:
          Date.now() - startedAt,

        transcriptLength:
          transcript.length,

        model: selectedModel,
      });

    console.log(
      `[YouTube] Mind map saved successfully: ${saved._id}`
    );

    // ========================================================
    // NOTIFICATION
    // ========================================================
    //
    // IMPORTANT:
    // This runs AFTER MongoDB save.
    // ========================================================

    await notifyMindMapGenerated({
      userId: req.user._id,

      title:
        "YouTube Study Mind Map",

      mindMapId: saved._id,
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        "Mind map generated, saved and notification sent successfully.",

      data: saved,

      mindMap: output,

      videoId,
    });
  } catch (error) {
    console.error(
      "MindMap Generation Error:",
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

// ============================================================
// REAL-TIME SSE GENERATION
// ============================================================
//
// POST /api/youtube/generate-stream
// ============================================================

const generateMindMapStream = async (
  req,
  res
) => {
  const startedAt = Date.now();

  // ==========================================================
  // SSE HEADERS
  // ==========================================================

  res.setHeader(
    "Content-Type",
    "text/event-stream; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "no-cache, no-transform"
  );

  res.setHeader(
    "Connection",
    "keep-alive"
  );

  res.setHeader(
    "X-Accel-Buffering",
    "no"
  );

  if (
    typeof res.flushHeaders ===
    "function"
  ) {
    res.flushHeaders();
  }

  // ==========================================================
  // CONNECTION STATE
  // ==========================================================

  let closed = false;

  const markClosed = () => {
    closed = true;
  };

  req.on("close", markClosed);
  res.on("close", markClosed);

  try {
    const {
      videoUrl,
      userPrompt,
    } = req.body || {};

    // ========================================================
    // VALIDATE URL
    // ========================================================

    if (!videoUrl?.trim()) {
      sendSSE(
        res,
        "error",
        {
          message:
            "YouTube video URL is required.",
        }
      );

      return res.end();
    }

    // ========================================================
    // VIDEO ID
    // ========================================================

    const videoId =
      getYouTubeVideoId(
        videoUrl.trim()
      );

    if (!videoId) {
      sendSSE(
        res,
        "error",
        {
          message:
            "Please provide a valid YouTube URL.",
        }
      );

      return res.end();
    }

    // ========================================================
    // STAGE 1 - VALIDATING
    // ========================================================

    sendSSE(
      res,
      "stage",
      {
        stage: "VALIDATING",

        progress: 10,

        message:
          "YouTube video validated successfully.",

        videoId,
      }
    );

    if (closed) {
      return;
    }

    // ========================================================
    // STAGE 2 - TRANSCRIPT
    // ========================================================

    sendSSE(
      res,
      "stage",
      {
        stage: "TRANSCRIPT",

        progress: 25,

        message:
          "Fetching video transcript...",
      }
    );

    if (closed) {
      return;
    }

    const transcriptResult =
      await getTranscript(
        videoUrl.trim()
      );

    const transcript =
      transcriptResult.transcript;

    if (
      !transcript ||
      transcript.length < 50
    ) {
      throw new Error(
        "The transcript is too short to generate a useful mind map."
      );
    }

    if (closed) {
      return;
    }

    // ========================================================
    // STAGE 3 - ANALYZING
    // ========================================================

    sendSSE(
      res,
      "stage",
      {
        stage: "ANALYZING",

        progress: 45,

        message:
          "Transcript loaded. Starting AI analysis...",

        transcriptLength:
          transcript.length,
      }
    );

    if (closed) {
      return;
    }

    // ========================================================
    // BUILD PROMPT
    // ========================================================

    const prompt =
      buildPrompt({
        transcript,
        userPrompt,
      });

    if (closed) {
      return;
    }

    // ========================================================
    // STAGE 4 - GENERATING
    // ========================================================

    sendSSE(
      res,
      "stage",
      {
        stage: "GENERATING",

        progress: 60,

        message:
          "AI is generating your study mind map...",
      }
    );

    if (closed) {
      return;
    }

    // ========================================================
    // GEMINI
    // ========================================================

    let selectedModel =
      PRIMARY_GEMINI_MODEL;

    const geminiResult =
      await generateGeminiWithFallback({
        prompt,

        onModelSelected: (
          model,
          modelIndex,
          totalModels
        ) => {
          selectedModel = model;

          if (!closed) {
            sendSSE(
              res,
              "model",
              {
                model,

                message:
                  `Using ${model} for AI generation...`,

                attempt:
                  modelIndex + 1,

                totalModels,
              }
            );
          }
        },
      });

    selectedModel =
      geminiResult.model;

    const output =
      geminiResult.text?.trim();

    if (!output) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    if (closed) {
      return;
    }

    // ========================================================
    // SEND GENERATED CONTENT AS SSE CHUNKS
    // ========================================================

    const chunkSize = 180;

    for (
      let index = 0;
      index < output.length;
      index += chunkSize
    ) {
      if (closed) {
        return;
      }

      const text =
        output.slice(
          index,
          index + chunkSize
        );

      sendSSE(
        res,
        "chunk",
        {
          text,
        }
      );

      await sleep(15);
    }

    if (closed) {
      return;
    }

    // ========================================================
    // STAGE 5 - SAVING
    // ========================================================

    sendSSE(
      res,
      "stage",
      {
        stage: "SAVING",

        progress: 90,

        message:
          "Saving your mind map...",
      }
    );

    if (closed) {
      return;
    }

    // ========================================================
    // SAVE TO MONGODB
    // ========================================================

    const saved =
      await YoutubeSummary.create({
        userId: req.user._id,

        videoUrl:
          videoUrl.trim(),

        videoId,

        title:
          "YouTube Study Mind Map",

        userPrompt:
          userPrompt?.trim() || "",

        transcript,

        mindMap: output,

        status:
          "COMPLETED",

        processingTimeMs:
          Date.now() - startedAt,

        transcriptLength:
          transcript.length,

        model:
          selectedModel,
      });

    console.log(
      `[YouTube Stream] Mind map saved: ${saved._id}`
    );

    // ========================================================
    // NOTIFICATION
    // ========================================================
    //
    // IMPORTANT:
    // MongoDB save completed BEFORE this function.
    // ========================================================

    await notifyMindMapGenerated({
      userId: req.user._id,

      title:
        "YouTube Study Mind Map",

      mindMapId: saved._id,
    });

    // ========================================================
    // SEND NOTIFICATION EVENT TO FRONTEND
    // ========================================================

    if (!closed) {
      sendSSE(
        res,
        "notification",
        {
          type: "success",

          message:
            "Your YouTube mind map has been generated and saved successfully.",

          mindMapId:
            saved._id,
        }
      );
    }

    if (closed) {
      return;
    }

    // ========================================================
    // COMPLETE
    // ========================================================

    sendSSE(
      res,
      "complete",
      {
        progress: 100,

        message:
          "Mind map generated successfully.",

        data: {
          _id:
            saved._id,

          videoId,

          videoUrl:
            saved.videoUrl,

          title:
            saved.title,

          userPrompt:
            saved.userPrompt,

          mindMap:
            saved.mindMap,

          status:
            saved.status,

          processingTimeMs:
            saved.processingTimeMs,

          transcriptLength:
            saved.transcriptLength,

          model:
            saved.model,

          createdAt:
            saved.createdAt,
        },
      }
    );

    return res.end();
  } catch (error) {
    console.error(
      "MindMap Stream Error:",
      error
    );

    if (
      !closed &&
      !res.writableEnded
    ) {
      sendSSE(
        res,
        "error",
        {
          message:
            getCleanGeminiErrorMessage(
              error
            ),
        }
      );

      return res.end();
    }
  }
};

// ============================================================
// GET USER MIND MAP HISTORY
// ============================================================
//
// GET /api/youtube/history
// ============================================================

const getMindMaps = async (
  req,
  res
) => {
  try {
    const maps =
      await YoutubeSummary.find({
        userId: req.user._id,
      })
        .select("-transcript")
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      data: maps,
    });
  } catch (error) {
    console.error(
      "Get Mind Maps Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to fetch mind maps.",
    });
  }
};

// ============================================================
// GET ONE MIND MAP
// ============================================================
//
// GET /api/youtube/:id
// ============================================================

const getMindMapById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,

        message:
          "Mind map ID is required.",
      });
    }

    const map =
      await YoutubeSummary.findOne({
        _id: id,

        userId: req.user._id,
      }).lean();

    if (!map) {
      return res.status(404).json({
        success: false,

        message:
          "Mind map not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: map,
    });
  } catch (error) {
    console.error(
      "Get Mind Map Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to fetch mind map.",
    });
  }
};

// ============================================================
// DELETE MIND MAP
// ============================================================
//
// DELETE /api/youtube/:id
// ============================================================

const deleteMindMap = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,

        message:
          "Mind map ID is required.",
      });
    }

    const deleted =
      await YoutubeSummary.findOneAndDelete({
        _id: id,

        userId: req.user._id,
      });

    if (!deleted) {
      return res.status(404).json({
        success: false,

        message:
          "Mind map not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Mind map deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Mind Map Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to delete mind map.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  generateMindMap,
  generateMindMapStream,
  getMindMaps,
  getMindMapById,
  deleteMindMap,
};