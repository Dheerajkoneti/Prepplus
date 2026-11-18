const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback"); // Adjust path to your model

// POST /api/feedback
router.post("/", async (req, res) => {
  try {
    const { rating, category, message } = req.body;

    if (!message || !rating || !category) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newFeedback = await Feedback.create({
      user: req.user ? req.user._id : undefined, // Attach user ID if auth middleware is present
      rating,
      category,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully!",
      data: newFeedback,
    });
  } catch (error) {
    console.error("❌ Feedback submission error:", error);
    res.status(500).json({ success: false, message: "Server error while saving feedback." });
  }
});

module.exports = router;