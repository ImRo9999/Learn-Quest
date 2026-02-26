const express = require("express");
const router = express.Router();
const axios = require("axios");
const LinkedInUser = require("../models/LinkedInProfile");

require("dotenv").config();

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/linkedin-callback"; // your frontend callback page

router.post("/auth/linkedin", async (req, res) => {
  const { code } = req.body;
  const authHeader = req.headers.authorization || "";
  const appToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing." });
  }
  if (!appToken) {
    return res.status(401).json({ message: "No App Token provided in headers." });
  }

  try {
    // Step 1: Exchange Code for Access Token
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const access_token = tokenRes.data.access_token;
    if (!access_token) {
      return res.status(400).json({ message: "Failed to receive LinkedIn access token." });
    }

    // Step 2: Fetch LinkedIn ID (basic /me call)
    const profileRes = await axios.get("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const linkedinId = profileRes.data.id;
    if (!linkedinId) {
      return res.status(400).json({ message: "Failed to retrieve LinkedIn ID." });
    }

    // Step 3: Save LinkedIn ID and Access Token
    const linkedinUser = await LinkedInUser.findOneAndUpdate(
      { linkedinId: linkedinId },
      {
        linkedinId: linkedinId,
        accessToken: access_token,
        loginDate: new Date()
      },
      { upsert: true, new: true }
    );

    // Step 4: Return
    res.json({
      message: "LinkedIn login successful.",
      user: linkedinUser,
      token: appToken
    });

  } catch (err) {
    console.error("LinkedIn login error:", err.response?.data || err.message);
    res.status(500).json({ message: "LinkedIn login failed.", error: err.message });
  }
});

// redirect fallback
router.get("/linkedin/callback", (req, res) => {
  res.redirect("http://localhost:3000/dashboard");
});

module.exports = router;
