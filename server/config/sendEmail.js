const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log("EMAIL ERROR:", err);
  } else {
    console.log("EMAIL READY");
  }
});

module.exports = async (email, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html,
  });
};