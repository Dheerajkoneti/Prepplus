const Resume = require("../models/Resume");
const parsePDF = require("../services/pdfParser");
const { analyzeResume } = require("../services/geminiService");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume uploaded",
      });
    }

    const extractedText = await parsePDF(req.file.path);

    const result = await analyzeResume(extractedText);

    const resume = await Resume.create({
      userId: req.body.userId || "guest",
      fileName: req.file.originalname,
      extractedText,
      score: result.score || 0,
      skills: result.skills || [],
      missingSkills: result.missingSkills || [],
      suggestions: result.suggestions || [],
      analysis: result.analysis || "",
    });

    res.status(200).json({
    success: true,
    score: result.score,
    skills: result.skills,
    missingSkills: result.missingSkills,
    suggestions: result.suggestions,
    analysis: result.analysis,
    });
  } catch (error) {
    console.error("Resume Upload Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadResume,
};