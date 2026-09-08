const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");
const {
  googleLogin,
} = require("../controllers/googleAuthController");

router.post("/google-login", googleLogin);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get(
  "/profile",
  protect,
  getProfile
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);
router.post(
  "/send-otp",
  sendOTP
);

router.post(
  "/verify-otp",
  verifyOTP
);
module.exports = router;