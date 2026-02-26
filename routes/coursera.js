const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware");
const axios = require("axios");
require("dotenv").config();

const User = require("../models/User");
const Course = require("../models/Course");
const Progress = require("../models/Progress");



const getCourseraAccessToken = async () => {
  const clientId = process.env.COURSERA_API_KEY;
  const clientSecret = process.env.COURSERA_API_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Coursera API credentials are missing in .env");
  }

  const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      "https://api.coursera.com/oauth2/client_credentials/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${base64}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error fetching Coursera token:", error.response?.data || error.message);
    throw error;
  }
};

router.get("/token-test", async (req, res) => {
    try {
      const accessToken = await getCourseraAccessToken();
      res.json({ accessToken });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


// ✅ Get Recommended Coursera Courses + Save to DB
router.get("/coursera/recommended", authMiddleware, async (req, res) => {
    const jobTitle = req.query.job && req.query.job !== "undefined" ? req.query.job : "Software Engineer";
  
    try {
      const accessToken = await getCourseraAccessToken();
  
      // First API call to get course IDs
      const response = await axios.get(
        `https://api.coursera.org/api/courses.v1?q=search&query=${encodeURIComponent(jobTitle)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      // Extract course IDs
      const courseIds = response.data.elements.map((course) => course.id);
      if (courseIds.length === 0) {
        return res.json([]); // Return empty if no courses found
      }
  
      // Second API call to get full details
      const detailsResponse = await axios.get(
        `https://api.coursera.org/api/courses.v1?ids=${courseIds.join(",")}&fields=name,description,photoUrl,slug`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      const courses = detailsResponse.data.elements || [];
  
      const savedCourses = [];
  
      for (let course of courses.slice(0, 10)) {
        const existing = await Course.findOne({
          userId: req.user.id,
          courseId: course.id,
          platform: "coursera"
        });
  
        if (!existing) {
          const newCourse = new Course({
            userId: req.user.id,
            courseId: course.id,
            name: course.name,
            description: course.description,
            slug: course.slug,
            thumbnail: course.photoUrl,
            status: "recommended",
            platform: "coursera"
          });
          await newCourse.save();
          savedCourses.push(newCourse);
        } else {
          savedCourses.push(existing);
        }
      }
  
      // ✅ Send response only once
      res.json({
        coursesFromAPI: courses,  // Freshly fetched from API
        savedCourses: savedCourses // Saved in the database
      });
  
    } catch (error) {
      console.error("Coursera API error:", error.message);
  
      if (!res.headersSent) {
        res.status(500).json({
          msg: "Error fetching Coursera course data",
          error: error.message,
        });
      }
    }
  });
  

// ✅ Get Completed Coursera Courses
router.get("/coursera/completed", authMiddleware, async (req, res) => {
  try {
    const completedCourses = await Course.find({
      userId: req.user.id,
      status: "completed"
    });

    res.json(completedCourses);
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching completed courses",
      error: error.message,
    });
  }
});

// ✅ Mark selected courses as completed
router.post("/courses/mark-completed", authMiddleware, async (req, res) => {
    const { courseIds, courseDetails } = req.body;
    const userId = req.user.id;
  
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ msg: "No course IDs provided" });
    }
  
    try {
        for (const courseId of courseIds) {
            const courseData = courseDetails.find(c => c.courseId === courseId || c.id === courseId);
          
            if (!courseData) continue;
          
            await Course.findOneAndUpdate(
              { userId, courseId },
              {
                status: "completed",
                progress: 100,
                completionDate: new Date(),
                name: courseData.name,
                description: courseData.description,
                slug: courseData.slug,
                thumbnail: courseData.thumbnail || courseData.photoUrl
              },
              { upsert: true, new: true }
            );
          
            await Progress.findOneAndUpdate(
              { userId, courseId },
              {
                percentageCompleted: 100,
                lastAccessed: new Date()
              },
              { upsert: true, new: true }
            );
          }
          
  
      res.json({ msg: "Courses marked as completed and progress updated" });
    } catch (err) {
      console.error("Error marking courses completed:", err);
      res.status(500).json({ msg: "Internal Server Error", error: err.message });
    }
  });
  

module.exports = router;


