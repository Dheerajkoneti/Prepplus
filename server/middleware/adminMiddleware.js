const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const role = String(req.user.role || "").toLowerCase();

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator access required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify administrator access.",
    });
  }
};

module.exports = {
  adminOnly,
};