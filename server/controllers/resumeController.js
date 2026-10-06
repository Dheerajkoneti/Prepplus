const fs = require("fs");

const Resume = require("../models/Resume");

const parsePDF = require("../services/pdfParser");

const {
  analyzeResume,
} = require("../services/resumeAIService");

// =====================================================
// NOTIFICATION SERVICE
// =====================================================

const {
  notifyResumeAnalyzed,
} = require("../services/notificationService");


// =====================================================
// CLEANUP UPLOADED FILE
// =====================================================

const cleanupUploadedFile = (filePath) => {
  if (!filePath) {
    return;
  }

  fs.unlink(filePath, (error) => {
    if (error && error.code !== "ENOENT") {
      console.error(
        "Resume File Cleanup Error:",
        error.message
      );
    }
  });
};


// =====================================================
// UPLOAD + ANALYZE RESUME
// POST /api/resume/upload
// =====================================================

const uploadResume = async (req, res) => {
  let resume = null;

  try {
    // -------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------

    if (!req.user || !req.user._id) {
      cleanupUploadedFile(
        req.file?.path
      );

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // -------------------------------------------------
    // CHECK FILE
    // -------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No resume uploaded.",
      });
    }


    // -------------------------------------------------
    // CHECK FILE TYPE
    // -------------------------------------------------

    if (
      req.file.mimetype &&
      req.file.mimetype !==
        "application/pdf"
    ) {
      cleanupUploadedFile(
        req.file.path
      );

      return res.status(400).json({
        success: false,
        message:
          "Only PDF files are allowed.",
      });
    }


    // -------------------------------------------------
    // EXTRACT PDF TEXT
    // -------------------------------------------------

    const extractedText =
      await parsePDF(
        req.file.path
      );

    if (
      !extractedText ||
      !extractedText.trim()
    ) {
      cleanupUploadedFile(
        req.file.path
      );

      return res.status(400).json({
        success: false,
        message:
          "Could not extract readable text from this PDF.",
      });
    }


    // -------------------------------------------------
    // CREATE RESUME RECORD
    // -------------------------------------------------

    resume =
      await Resume.create({
        userId: req.user._id,

        fileName:
          req.file.originalname,

        extractedText,

        status: "ANALYZING",

        analysisError: "",
      });


    // -------------------------------------------------
    // AI ANALYSIS
    // -------------------------------------------------

    const result =
      await analyzeResume(
        extractedText
      );

    if (!result) {
      throw new Error(
        "Resume AI returned an empty result."
      );
    }


    // -------------------------------------------------
    // SCORE
    // -------------------------------------------------

    resume.score =
      Number(result.score) || 0;


    // -------------------------------------------------
    // METRICS
    // -------------------------------------------------

    resume.metrics = {
      keywordRelevance:
        Number(
          result.metrics
            ?.keywordRelevance
        ) || 0,

      formatting:
        Number(
          result.metrics
            ?.formatting
        ) || 0,

      impact:
        Number(
          result.metrics?.impact
        ) || 0,

      completeness:
        Number(
          result.metrics
            ?.completeness
        ) || 0,
    };


    // -------------------------------------------------
    // SKILLS
    // -------------------------------------------------

    resume.skills =
      Array.isArray(
        result.skills
      )
        ? result.skills
        : [];


    // -------------------------------------------------
    // MISSING SKILLS
    // -------------------------------------------------

    resume.missingSkills =
      Array.isArray(
        result.missingSkills
      )
        ? result.missingSkills
        : [];


    // -------------------------------------------------
    // STRENGTHS
    // -------------------------------------------------

    resume.strengths =
      Array.isArray(
        result.strengths
      )
        ? result.strengths
        : [];


    // -------------------------------------------------
    // WEAKNESSES
    // -------------------------------------------------

    resume.weaknesses =
      Array.isArray(
        result.weaknesses
      )
        ? result.weaknesses
        : [];


    // -------------------------------------------------
    // SUGGESTIONS
    // -------------------------------------------------

    resume.suggestions =
      Array.isArray(
        result.suggestions
      )
        ? result.suggestions
        : [];


    // -------------------------------------------------
    // ATS ISSUES
    // -------------------------------------------------

    resume.atsIssues =
      Array.isArray(
        result.atsIssues
      )
        ? result.atsIssues
        : [];


    // -------------------------------------------------
    // EXECUTIVE SUMMARY
    // -------------------------------------------------

    resume.executiveSummary =
      result.executiveSummary ||
      "";


    // -------------------------------------------------
    // ANALYSIS
    // -------------------------------------------------

    resume.analysis =
      result.analysis || "";


    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    resume.status =
      "COMPLETED";


    // -------------------------------------------------
    // ANALYZED DATE
    // -------------------------------------------------

    resume.analyzedAt =
      new Date();


    // -------------------------------------------------
    // CLEAR ERROR
    // -------------------------------------------------

    resume.analysisError =
      "";


    // -------------------------------------------------
    // SAVE FINAL RESULT
    // -------------------------------------------------

    await resume.save();


    // =================================================
    // CREATE NOTIFICATION
    // =================================================
    //
    // IMPORTANT:
    // This happens ONLY after the resume has been
    // successfully analyzed and saved.
    //
    // If notification creation fails, the resume
    // analysis should still remain successful.
    // =================================================

    try {
      await notifyResumeAnalyzed({
        userId: req.user._id,

        score:
          resume.score || 0,
      });
    } catch (notificationError) {
      console.error(
        "Resume Notification Error:",
        notificationError
      );
    }


    // -------------------------------------------------
    // DELETE TEMPORARY PDF
    // -------------------------------------------------

    cleanupUploadedFile(
      req.file.path
    );


    // -------------------------------------------------
    // SUCCESS RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Resume analyzed successfully.",

      resume: {
        id: resume._id,

        fileName:
          resume.fileName,

        score:
          resume.score,

        metrics:
          resume.metrics,

        skills:
          resume.skills,

        missingSkills:
          resume.missingSkills,

        strengths:
          resume.strengths,

        weaknesses:
          resume.weaknesses,

        suggestions:
          resume.suggestions,

        atsIssues:
          resume.atsIssues,

        executiveSummary:
          resume.executiveSummary,

        analysis:
          resume.analysis,

        status:
          resume.status,

        analyzedAt:
          resume.analyzedAt,

        createdAt:
          resume.createdAt,
      },
    });

  } catch (error) {

    // -------------------------------------------------
    // ERROR LOG
    // -------------------------------------------------

    console.error(
      "Resume Upload Error:",
      error
    );


    // -------------------------------------------------
    // SAVE FAILED STATUS
    // -------------------------------------------------

    if (resume) {
      resume.status =
        "FAILED";

      resume.analysisError =
        error?.message ||
        "Resume analysis failed.";

      await resume.save().catch(
        (saveError) => {
          console.error(
            "Failed to save resume error state:",
            saveError
          );
        }
      );
    }


    // -------------------------------------------------
    // DELETE TEMP FILE
    // -------------------------------------------------

    cleanupUploadedFile(
      req.file?.path
    );


    // -------------------------------------------------
    // ERROR RESPONSE
    // -------------------------------------------------

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Resume analysis failed.",
    });
  }
};


// =====================================================
// GET RESUME HISTORY
// GET /api/resume/history
// =====================================================

const getResumeHistory = async (
  req,
  res
) => {
  try {

    // -------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // -------------------------------------------------
    // GET USER RESUMES
    // -------------------------------------------------

    const resumes =
      await Resume.find({
        userId: req.user._id,
      })
        .select("-extractedText")
        .sort({
          createdAt: -1,
        })
        .lean();


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      count:
        resumes.length,

      resumes,
    });

  } catch (error) {

    console.error(
      "Resume History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch resume history.",
    });
  }
};


// =====================================================
// GET RESUME BY ID
// GET /api/resume/:id
// =====================================================

const getResumeById = async (
  req,
  res
) => {
  try {

    // -------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // -------------------------------------------------
    // CHECK ID
    // -------------------------------------------------

    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message:
          "Resume ID is required.",
      });
    }


    // -------------------------------------------------
    // FIND RESUME
    // -------------------------------------------------

    const resume =
      await Resume.findOne({
        _id: req.params.id,

        userId:
          req.user._id,
      })
        .select("-extractedText")
        .lean();


    // -------------------------------------------------
    // NOT FOUND
    // -------------------------------------------------

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "Resume analysis not found.",
      });
    }


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      resume,
    });

  } catch (error) {

    console.error(
      "Get Resume Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch resume.",
    });
  }
};


// =====================================================
// DELETE RESUME
// DELETE /api/resume/:id
// =====================================================

const deleteResume = async (
  req,
  res
) => {
  try {

    // -------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    // -------------------------------------------------
    // CHECK ID
    // -------------------------------------------------

    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message:
          "Resume ID is required.",
      });
    }


    // -------------------------------------------------
    // DELETE
    // -------------------------------------------------

    const resume =
      await Resume.findOneAndDelete({
        _id: req.params.id,

        userId:
          req.user._id,
      });


    // -------------------------------------------------
    // NOT FOUND
    // -------------------------------------------------

    if (!resume) {
      return res.status(404).json({
        success: false,
        message:
          "Resume not found.",
      });
    }


    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Resume analysis deleted successfully.",

      deletedResumeId:
        resume._id,
    });

  } catch (error) {

    console.error(
      "Delete Resume Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete resume.",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
};