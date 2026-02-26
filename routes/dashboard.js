const express = require("express");
const authMiddleware = require("../middleware");
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');


const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

router.post("/job-title", authMiddleware, async (req, res) => {
    try {
      const { jobTitle } = req.body;
      if (!jobTitle) return res.status(400).json({ msg: "Job title is required" });
  
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { jobTitle },
        { new: true }
      ).select("-password");
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ msg: "Failed to update job title", error: error.message });
    }
  });

module.exports = router;