// server/routes/healthRoutes.js

const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    status: "online",
    service: "PrepPulse API",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;