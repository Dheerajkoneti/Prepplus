const Certificate =
  require("../models/Certificate");


// ======================================================
// GET MY CERTIFICATES
// GET /api/certificates/my
// ======================================================

const getMyCertificates = async (
  req,
  res
) => {
  try {

    const certificates =
      await Certificate.find({
        userId: req.user._id,
      })
        .populate({
          path: "courseId",
          select:
            "title language level description",
        })
        .sort({
          issuedAt: -1,
        });

    return res.status(200).json({
      success: true,
      certificates,
    });

  } catch (error) {

    console.error(
      "Get My Certificates Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch certificates.",
    });
  }
};


// ======================================================
// GET SINGLE CERTIFICATE
// GET /api/certificates/:certificateId
// ======================================================

const getCertificate = async (
  req,
  res
) => {
  try {

    const { certificateId } =
      req.params;

    const certificate =
      await Certificate.findOne({
        certificateId,
      })
        .populate({
          path: "courseId",
          select:
            "title language level description",
        })
        .populate({
          path: "userId",
          select:
            "name email",
        });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message:
          "Certificate not found.",
      });
    }

    // Only certificate owner can use
    // this protected endpoint.
    if (
      certificate.userId &&
      certificate.userId._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this certificate.",
      });
    }

    return res.status(200).json({
      success: true,
      certificate,
    });

  } catch (error) {

    console.error(
      "Get Certificate Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch certificate.",
    });
  }
};


// ======================================================
// VERIFY CERTIFICATE
// GET /api/certificates/verify/:certificateId
// PUBLIC
// ======================================================

const verifyCertificate = async (
  req,
  res
) => {
  try {

    const { certificateId } =
      req.params;

    const certificate =
      await Certificate.findOne({
        certificateId,
      })
        .populate({
          path: "courseId",
          select:
            "title language level",
        });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message:
          "Certificate not found or invalid.",
      });
    }

    return res.status(200).json({
      success: true,

      valid: true,

      certificate: {
        certificateId:
          certificate.certificateId,

        studentName:
          certificate.studentName,

        courseName:
          certificate.courseName,

        score:
          certificate.score,

        issuedAt:
          certificate.issuedAt,

        course:
          certificate.courseId,
      },
    });

  } catch (error) {

    console.error(
      "Verify Certificate Error:",
      error
    );

    return res.status(500).json({
      success: false,
      valid: false,
      message:
        "Certificate verification failed.",
    });
  }
};


module.exports = {
  getMyCertificates,
  getCertificate,
  verifyCertificate,
};