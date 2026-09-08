const Note = require("../models/Notes");

// Save Note
exports.saveNote = async (req, res) => {
  try {
    const { title, content, subject, tags } = req.body;

    const note = await Note.create({
      userId: req.user._id,
      title,
      content,
      subject,
      tags,
    });

    res.status(201).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save note",
    });
  }
};

// Get All Notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
    });
  }
};

// Get Single Note
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch note",
    });
  }
};

// Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete note",
    });
  }
};

//Generate Notes

const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateNotes = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const result = await model.generateContent(`
      Generate detailed study notes on ${topic}.

      Include:
      1. Introduction
      2. Definitions
      3. Key Concepts
      4. Advantages
      5. Disadvantages
      6. Real-world Examples
      7. Interview Questions
      8. Summary
    `);

    const notes = result.response.text();

    res.status(200).json({
      success: true,
      notes,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
