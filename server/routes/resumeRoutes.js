const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
} = require("../controllers/resumeController");

const router = express.Router();

const uploadDirectory = path.join(
  process.cwd(),
  "uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const originalName = path.basename(
      file.originalname
    );

    const safeName = originalName
      .replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      )
      .replace(
        /\.{2,}/g,
        "."
      );

    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}-${safeName}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (
  req,
  file,
  cb
) => {
  const isPDF =
    file.mimetype ===
      "application/pdf" ||
    path
      .extname(file.originalname)
      .toLowerCase() === ".pdf";

  if (!isPDF) {
    return cb(
      new Error(
        "Only PDF files are allowed."
      ),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
    files: 1,
  },
});

router.get(
  "/history",
  protect,
  getResumeHistory
);

router.get(
  "/:id",
  protect,
  getResumeById
);

router.delete(
  "/:id",
  protect,
  deleteResume
);

router.post(
  "/upload",
  protect,
  upload.single("resume"),
  uploadResume
);

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Resume file must be smaller than 5 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Resume upload failed.",
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Invalid resume file.",
      });
    }

    next();
  }
);

module.exports = router;