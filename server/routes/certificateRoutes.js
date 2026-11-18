const express = require("express");

const router = express.Router();

const {
  getMyCertificates,
  getCertificate,
  verifyCertificate,
} = require("../controllers/certificateController");

const {
  protect,
} = require("../middleware/authMiddleware");


// =========================================================
// USER CERTIFICATES
// =========================================================

// Get logged-in user's certificates
router.get(
  "/my",
  protect,
  getMyCertificates
);


// =========================================================
// PUBLIC CERTIFICATE VERIFICATION
// =========================================================

// Anyone can verify certificate
router.get(
  "/verify/:certificateId",
  verifyCertificate
);


// =========================================================
// PROTECTED CERTIFICATE DETAILS
// =========================================================

router.get(
  "/:certificateId",
  protect,
  getCertificate
);


module.exports = router;