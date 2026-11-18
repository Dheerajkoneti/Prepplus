const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect private routes
 *
 * Expected header:
 * Authorization: Bearer <JWT_TOKEN>
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    // =========================================================
    // 1. CHECK AUTHORIZATION HEADER
    // =========================================================

    const authHeader = req.headers.authorization;

    if (
      authHeader &&
      /^Bearer\s+/i.test(authHeader)
    ) {
      token = authHeader
        .replace(/^Bearer\s+/i, "")
        .trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token found.",
      });
    }

    // =========================================================
    // 2. CHECK JWT SECRET
    // =========================================================

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing from environment variables."
      );

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    // =========================================================
    // 3. VERIFY TOKEN
    // =========================================================

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "JWT Verification Error:",
        jwtError.message
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    // =========================================================
    // 4. CHECK USER ID INSIDE TOKEN
    // =========================================================

    const userId =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // =========================================================
    // 5. FIND USER
    // =========================================================

    const user = await User.findById(userId)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    // =========================================================
    // 6. ATTACH USER TO REQUEST
    // =========================================================

    req.user = user;

    // Continue to controller
    next();

  } catch (error) {

    console.error(
      "Authentication Middleware Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to authenticate the request.",
    });
  }
};


module.exports = {
  protect,
};