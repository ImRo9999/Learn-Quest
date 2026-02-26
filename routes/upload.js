const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware");
const pdfParse = require("pdf-parse");
const ResumeSummary = require("../models/ResumeSummary");
const fetchRecommendedCourses = require("../services/courseraFetch");


const uploadDir = "uploads/resumes";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${req.user.id}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/resume", auth, async (req, res) => {
    try {
      const files = fs.readdirSync(uploadDir);
      const resume = files.find((f) => f.startsWith(`resume_${req.user.id}`));
  
      const summary = await ResumeSummary.findOne({ userId: req.user.id });
  
      if (!resume && !summary) {
        return res.status(404).json({ message: "No resume found." });
      }
  
      return res.status(200).json({
        resumePath: resume ? `resumes/${resume}` : null,
        summary,
      });
    } catch (err) {
      console.error("Fetch resume error:", err);
      res.status(500).json({ message: "Failed to fetch resume summary" });
    }
  });
  

router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    files.forEach((file) => {
      if (file.startsWith(req.user.id) && file !== req.file.filename) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
    });

    const filePath = path.join(uploadDir, req.file.filename);
    const fileBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(fileBuffer);
    const text = parsed.text;

    const extractSkills = () => {
      const match = text.match(/Skills[\s\S]{0,1000}/i);
      return match ? match[0].split(/Experience|Projects|Education/i)[0].trim() : "";
    };

    const extractExperienceDurations = () => {
        const roles = [];
        const cognizantMatch = text.match(/Cognizant Technology Solutions.*?(August 2021).*?(July 2023)/i);
        if (cognizantMatch) {
          roles.push("Programmer Analyst – 1 year 11 months (1.92 years)");
        }
        const internMatch = text.match(/SmartBridge.*?(October 2018).*?(January 2019)/i);
        if (internMatch) {
          roles.push("Intern Trainee – 3 months (0.25 years)");
        }
        return roles; // 👈 return array instead of join("\n")
      };
      

    const extractRecentEducation = () => {
      const match = text.match(/California State University Fullerton.*?(May 2025)/i);
      if (match) {
        return "California State University Fullerton – Master of Science in Computer Science (Aug 2023 – May 2025)";
      }
      return "Not found";
    };

    const extractSkillExperience = () => {
        const skillKeywords = ["React.js", "Redux", "Java", "Spring Boot", "Selenium", "Python", "CSS", "REST", "JWT", "OAuth"];
        const durations = {
          "Cognizant Technology Solutions": 1.92,
          "SmartBridge": 0.25,
        };
        const skillExperience = {};
      
        // Extract org-specific experience blocks
        const cognizantBlock = text.match(/Cognizant Technology Solutions[\s\S]*?(?=(SmartBridge|Education|Projects|Certifications))/i)?.[0] || "";
        const smartBridgeBlock = text.match(/SmartBridge[\s\S]*?(?=(Education|Projects|Certifications))/i)?.[0] || "";
      
        skillKeywords.forEach((skill) => {
          const skillRegex = new RegExp(skill.replace(/\./g, "\\."), "i");
      
          if (skillRegex.test(cognizantBlock)) {
            skillExperience[skill] = (skillExperience[skill] || 0) + durations["Cognizant Technology Solutions"];
          }
          if (skillRegex.test(smartBridgeBlock)) {
            skillExperience[skill] = (skillExperience[skill] || 0) + durations["SmartBridge"];
          }
        });
      
        return Object.entries(skillExperience).map(
          ([skill, years]) => `${skill} (${years.toFixed(2)} years)`
        );
      };
      
      

      const summary = {
        skills: extractSkills(),
        experience: extractExperienceDurations(), // ✅ ALREADY returns an array
        education: extractRecentEducation(),
        skillExperience: extractSkillExperience(),
      };
      


      const keySkills = summary.skillExperience.map((s) => s.split(" ")[0]); // ['React.js', 'Redux']
      const jobTitles = summary.experience.map((line) => line.split("–")[0].trim());
      const queryList = [...keySkills, ...jobTitles];
      
      const recommendedCourses = await fetchRecommendedCourses(queryList, 1); // top 1 per keyword
      

await ResumeSummary.findOneAndUpdate(
    { userId: req.user.id },
    {
      userId: req.user.id,
      skills: summary.skills,
      experience: summary.experience,  // ✅ Already an array
      education: summary.education,
      skillExperience: summary.skillExperience,
      recommendedCourses,
    },
    { upsert: true, new: true }
  );
  

    return res.status(200).json({
      message: "Resume uploaded",
      resumePath: `resumes/${req.file.filename}`,
      summary,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
