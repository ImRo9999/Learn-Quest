const mongoose = require("mongoose");

const LinkedInUserSchema = new mongoose.Schema({
  linkedinId: { type: String, required: true, unique: true },
  loginDate: { type: Date, default: Date.now },
  idToken: { type: String }
});

module.exports = mongoose.model("LinkedInUser", LinkedInUserSchema);
