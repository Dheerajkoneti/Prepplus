const YoutubeSummary = require("../models/YoutubeSummary");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { YoutubeTranscript } = require("youtube-transcript");

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
);

exports.generateMindMap = async (req, res) => {
  try {
    const { videoUrl, userPrompt } = req.body;

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required",
      });
    }

    let transcript = "";

    try {
      const transcriptData =
        await YoutubeTranscript.fetchTranscript(videoUrl);

      transcript = transcriptData
        .map((item) => item.text)
        .join(" ");
    } catch (error) {
      console.error("Transcript Error:", error);

      return res.status(400).json({
        success: false,
        message:
          "Transcript unavailable for this video. Please use a video with captions enabled.",
      });
    }

    console.log("Transcript Length:", transcript.length);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `
You are an AI Study Assistant.

User Request:
${userPrompt || "Create a detailed study mind map."}

Generate the response using the following transcript.

Transcript:
${transcript}
`;

    const result = await model.generateContent(prompt);

    const output = result.response.text();

    const saved = await YoutubeSummary.create({
      userId: req.user.id,
      videoUrl,
      transcript,
      mindMap: output,
    });

    return res.status(200).json({
      success: true,
      data: saved,
      mindMap: output,
    });
  } catch (err) {
    console.error("MindMap Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate content",
    });
  }
};

exports.getMindMaps = async (req, res) => {
  try {
    const maps = await YoutubeSummary.find({
      userId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: maps,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteMindMap = async (req, res) => {
  try {
    await YoutubeSummary.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Mind Map deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};