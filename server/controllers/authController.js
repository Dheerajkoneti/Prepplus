const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../config/sendEmail");

/*
=====================================
SEND EMAIL OTP
=====================================
*/

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: "Temp User",
        email,
        phone: "0000000000",
        password: "",
        isEmailVerified: false,
      });
    }

    user.emailOTP = otp;
    user.otpExpire =
      Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "PrepPulse Email Verification",
      `
Your PrepPulse verification code:

${otp}

Valid for 5 minutes.
`
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
/*
=====================================
VERIFY EMAIL OTP
=====================================
*/

const verifyOTP = async (
  req,
  res
) => {
  try {
    const { email, otp } =
      req.body;

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    if (
      user.emailOTP !== otp
    ) {
      return res.status(400).json({
        message:
          "Invalid OTP",
      });
    }

    if (
      user.otpExpire <
      Date.now()
    ) {
      return res.status(400).json({
        message:
          "OTP Expired",
      });
    }

    user.isEmailVerified = true;
    user.emailOTP = "";
    user.otpExpire = null;
    await user.save();
    res.status(200).json({
      success: true,
      message:
        "Email verified successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    let existingUser =
      await User.findOne({ email });

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    // User already registered
    if (
      existingUser &&
      existingUser.name !== "Temp User"
    ) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Convert Temp User into real user
    if (
      existingUser &&
      existingUser.name === "Temp User"
    ) {
      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password =
        hashedPassword;

      await existingUser.save();

      return res.status(201).json({
        success: true,
        message:
          "Registration completed successfully",
      });
    }

    // Create completely new user
    const user =
      await User.create({
        name,
        email,
        phone,
        password:
          hashedPassword,
        isEmailVerified:
          false,
      });

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      message:
        "Registration successful. Please verify your email.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};
/*
=====================================
LOGIN USER
=====================================
*/

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    // User not found
    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // Email not verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        message:
          "Please verify your email first",
      });
    }

    // Check password
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }
    if (user.googleId && !user.password) {
      return res.status(401).json({
        message:
          "Please login using Google",
      });
    }

    // Login success
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
/*
=====================================
GET PROFILE
=====================================
*/

const getProfile = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      isEmailVerified:
        req.user.isEmailVerified,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
=====================================
FORGOT PASSWORD
=====================================
*/
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Highly polished, stunning email template layout
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PrepPulse Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #08142d; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #0f172a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255, 255, 255, 0.08);">
            
            <!-- Header Banner with Gradient Glow -->
            <tr>
              <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="display: inline-block; width: 50px; height: 50px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 14px; line-height: 50px; text-align: center; margin-bottom: 12px; font-size: 22px;">
                  🚀
                </div>
                <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 900; letter-spacing: 0.5px;">PrepPulse</h1>
                <p style="color: #38bdf8; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 2px;">Learn • Practice • Grow</p>
              </td>
            </tr>

            <!-- Main Body Content -->
            <tr>
              <td style="padding: 40px; background-color: #1e293b;">
                <h2 style="color: #ffffff; font-size: 22px; margin-top: 0; margin-bottom: 15px; font-weight: 800;">
                  Hello <span style="color: #38bdf8;">${user.name}</span>,
                </h2>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                  We received a request to securely reset the password for your PrepPulse account. Click the button below to choose your new password.
                </p>

                <!-- Glassmorphism Style Action Card -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 35px; text-align: center;">
                  <tr>
                    <td>
                      <div style="width: 60px; height: 60px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 50%; margin: 0 auto 18px auto; line-height: 60px; text-align: center; font-size: 26px;">
                        🔒
                      </div>
                      <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; font-weight: 800;">Reset Your Password</h3>
                      <p style="color: #94a3b8; font-size: 13px; margin: 0 0 25px 0;">This secure authorization link is valid for <strong>15 minutes</strong>.</p>
                      
                      <a href="${resetUrl}" target="_blank" style="background: linear-gradient(135deg, #0062ff, #004fe5); color: #ffffff; padding: 15px 36px; border-radius: 14px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 6px 20px rgba(0, 98, 255, 0.4); font-size: 15px; transition: transform 0.2s;">
                        Reset Password &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Fallback Link Section -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 25px;">
                  <tr>
                    <td style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 12px; padding: 16px; word-break: break-all;">
                      <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0; font-weight: 600;">Button not clickable? Copy and paste this link into your browser:</p>
                      <a href="${resetUrl}" target="_blank" style="color: #38bdf8; font-size: 12px; text-decoration: underline;">${resetUrl}</a>
                    </td>
                  </tr>
                </table>

                <!-- Warning Box -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px;">
                  <tr>
                    <td style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 12px 12px 0; color: #fbbf24; font-size: 13px;">
                      ⚠️ <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email safely. Your account remains completely secure.
                    </td>
                  </tr>
                </table>

                <p style="color: #94a3b8; font-size: 14px; margin-top: 35px; margin-bottom: 4px;">
                  Best regards,
                </p>
                <p style="color: #ffffff; font-size: 15px; font-weight: bold; margin: 0;">
                  Team PrepPulse
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #08142d; padding: 25px 40px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.06);">
                <p style="margin: 0 0 5px 0;">&copy; ${new Date().getFullYear()} PrepPulse. All rights reserved.</p>
                <p style="margin: 0; color: #38bdf8; font-weight: 500;">Your AI-Powered Learning Platform</p>
              </td>
            </tr>

          </table>
        </body>
      </html>
    `;

    await sendEmail(
      user.email,
      "PrepPulse Password Reset",
      htmlTemplate
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
/*
=====================================
RESET PASSWORD
=====================================
*/

const resetPassword = async (
  req,
  res
) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired reset token",
      });
    }

    const salt =
      await bcrypt.genSalt(10);

    user.password =
      await bcrypt.hash(
        password,
        salt
      );

    user.resetPasswordToken =
      undefined;

    user.resetPasswordExpire =
      undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successful",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
=====================================
EXPORTS
=====================================
*/

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
};