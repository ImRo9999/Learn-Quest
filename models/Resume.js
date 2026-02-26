const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Resume", ResumeSchema);
 