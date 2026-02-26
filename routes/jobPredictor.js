const express = require("express");
const router = express.Router();
const { loadJobs, predictJobs } = require("../job_predictor");
const authMiddleware = require("../middleware");
const ResumeSummary = require("../models/ResumeSummary");

// Load jobs on server start
loadJobs();

router.post("/predict", (req, res) => {
  const { skills } = req.body;
  if (!skills || !Array.isArray(skills)) {
    return res.status(400).json({ message: "Skills array required." });
  }
  const predictions = predictJobs(skills);
  res.json({ predictedJob: predictions });
});

router.get("/summary", authMiddleware, async (req, res) => {
    try {
      const summary = await ResumeSummary.findOne({ userId: req.user.id });
      if (!summary) return res.status(404).json({ message: "No resume summary found" });
      res.json(summary);
    } catch (err) {
      console.error("Fetch resume summary error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
