const crypto = require("crypto");

const Certificate =
  require("../models/Certificate");

const Enrollment =
  require("../models/Enrollment");

const Course =
  require("../models/Course");

const User =
  require("../models/User");


/**
 * Generate a unique certificate ID.
 *
 * Example:
 *
 * PP-JAVA-2026-A4F91C
 */
const generateCertificateId = (
  language = "COURSE"
) => {

  const prefix =
    String(language)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 6)
      .toUpperCase();

  const year =
    new Date().getFullYear();

  const random =
    crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

  return `PP-${prefix}-${year}-${random}`;
};


/**
 * Create a certificate after the student
 * becomes eligible.
 */
const createCertificate = async (
  userId,
  courseId
) => {

  // Prevent duplicate certificates.
  const existing =
    await Certificate.findOne({
      userId,
      courseId,
    });

  if (existing) {
    return existing;
  }

  const enrollment =
    await Enrollment.findOne({
      userId,
      courseId,
    });

  if (!enrollment) {
    throw new Error(
      "Enrollment not found."
    );
  }

  if (!enrollment.certificateEligible) {
    throw new Error(
      "Student is not eligible for a certificate."
    );
  }

  const course =
    await Course.findById(courseId);

  if (!course) {
    throw new Error(
      "Course not found."
    );
  }

  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error(
      "User not found."
    );
  }

 const studentName = user.name || "Student";

  const certificate =
    await Certificate.create({
      certificateId:
        generateCertificateId(
          course.language
        ),

      userId,

      courseId,

      studentName,

      courseName:
        course.title,

      score:
        enrollment.finalExamScore,

      issuedAt: new Date(),
    });

  return certificate;
};


module.exports = {
  createCertificate,
  generateCertificateId,
};