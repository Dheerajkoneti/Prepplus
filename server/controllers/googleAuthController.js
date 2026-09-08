const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const googleLogin = async (
  req,
  res
) => {
  try {
    const { credential } = req.body;

    const ticket =
      await client.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    const {
      email,
      name,
      picture,
    } = payload;

    let user =
      await User.findOne({
        email,
      });
    if (user && !user.googleId) {
      user.googleId = payload.sub;
      user.profilePicture = picture;
      await user.save();
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        phone: "",
        googleId: payload.sub,
        profilePicture: picture,
        isEmailVerified: true,
        password: "",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      picture: user.profilePicture,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Google Authentication Failed",
    });
  }
};

module.exports = {
  googleLogin,
};