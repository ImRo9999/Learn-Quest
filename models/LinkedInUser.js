const mongoose = require("mongoose");

const LinkedInUserSchema = new mongoose.Schema({
  linkedinId: { type: String, required: true, unique: true },
  loginDate: { type: Date, default: Date.now },
  idToken: { type: String },
  accessToken: { type: String },
  fullName: { type: String },
  email: { type: String },
  profilePicture: { type: String },
  headline: { type: String },
  publicProfileUrl: { type: String }
});

module.exports = mongoose.model("LinkedInUser", LinkedInUserSchema);
