// models/ResumeSummary.js
const mongoose = require("mongoose");

const ResumeSummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  skills: String,
  experience: [String],
  education: String,
  skillExperience: [String],
  recommendedCourses: [
    {
      courseId: String,
      name: String,
      description: String,
      slug: String,
      photoUrl: String,
      platform: { type: String, default: "coursera" },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("ResumeSummary", ResumeSummarySchema);
