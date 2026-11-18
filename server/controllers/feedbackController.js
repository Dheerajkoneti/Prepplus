const Feedback = require("../models/Feedback");

// Submit Feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { message, rating, category } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Feedback message is required." });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      message,
      rating: rating || 5,
      category: category || "General Feedback",
    });

    res.status(201).json({ success: true, message: "Feedback submitted successfully!", feedback });
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ success: false, message: "Server error submitting feedback." });
  }
};

// Get All Feedback (Admin Only)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    console.error("Get feedback error:", err);
    res.status(500).json({ success: false, message: "Server error fetching feedback." });
  }
};