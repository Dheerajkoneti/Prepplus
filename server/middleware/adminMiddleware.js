/**
 * Admin-only middleware
 *
 * IMPORTANT:
 * This middleware must be used AFTER `protect`.
 *
 * Example:
 *
 * router.post(
 *   "/",
 *   protect,
 *   adminOnly,
 *   controller
 * );
 */
const adminOnly = (
  req,
  res,
  next
) => {

  try {

    // =========================================================
    // 1. CHECK AUTHENTICATED USER
    // =========================================================

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // =========================================================
    // 2. CHECK USER ROLE
    // =========================================================

    const role = String(
      req.user.role || ""
    )
      .trim()
      .toLowerCase();


    // =========================================================
    // 3. ALLOW ONLY ADMIN
    // =========================================================

    if (role !== "admin") {

      return res.status(403).json({
        success: false,
        message:
          "Administrator access required.",
      });
    }


    // =========================================================
    // 4. ADMIN VERIFIED
    // =========================================================

    next();

  } catch (error) {

    console.error(
      "Admin Middleware Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify administrator access.",
    });
  }
};


module.exports = {
  adminOnly,
};