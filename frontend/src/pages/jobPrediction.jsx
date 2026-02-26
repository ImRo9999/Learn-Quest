import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/jobprediction.css";

const JobPrediction = () => {
  const [skills, setSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [educationLevel, setEducationLevel] = useState("Bachelor's");
  const [prediction, setPrediction] = useState([]);

  useEffect(() => {
    const fetchResumeSummary = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/job-predictor/summary", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        const data = res.data;

        if (data?.skills) {
          setSkills(data.skills);
        }

        if (data?.experience?.length > 0) {
          if (data.experience.length <= 1) setExperienceLevel("Entry Level");
          else if (data.experience.length <= 3) setExperienceLevel("Mid Level");
          else setExperienceLevel("Senior Level");
        }

        if (data?.education) {
          if (data.education.toLowerCase().includes("phd")) setEducationLevel("PhD");
          else if (data.education.toLowerCase().includes("master")) setEducationLevel("Master's");
          else setEducationLevel("Bachelor's");
        }
      } catch (err) {
        console.error("Fetch resume summary error:", err.response?.data || err.message);
      }
    };

    fetchResumeSummary();
  }, []);

  const handlePredict = async () => {
    try {
      const skillArray = skills
        .toLowerCase()
        .replace(/\n/g, " ")
        .replace(/[^a-z0-9, ]/gi, "")
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      if (skillArray.length === 0) {
        setPrediction([]);
        return;
      }

      const res = await axios.post("http://localhost:5001/api/job-predictor/predict", {
        skills: skillArray,
        experienceLevel,
        educationLevel,
      });

      setPrediction(res.data.predictedJob || []);
    } catch (err) {
      console.error("Prediction error:", err.response?.data || err.message);
      setPrediction([]);
    }
  };

  return (
    <div className="job-prediction-page">
      <h2>Predict Your Next Job Role</h2>

      <textarea
        placeholder="Enter your top skills (comma separated)..."
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        rows={4}
        className="input-textarea"
      />

      <div className="input-group">
        <label>Experience Level:</label>
        <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
          <option>Entry Level</option>
          <option>Mid Level</option>
          <option>Senior Level</option>
        </select>
      </div>

      <div className="input-group">
        <label>Education Level:</label>
        <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
          <option>Bachelor's</option>
          <option>Master's</option>
          <option>PhD</option>
        </select>
      </div>

      <button className="predict-btn" onClick={handlePredict}>
        Predict Job
      </button>

      {prediction.length > 0 && (
        <div className="prediction-result">
          <h3>Predicted Roles:</h3>
          <div className="card-grid">
            {prediction.map((job, idx) => (
              <div key={idx} className="job-card">
                <h4>{job.Job_Title}</h4>
                <p><strong>Industry:</strong> {job.Industry}</p>
                <p><strong>Location:</strong> {job.Location}</p>
                <p><strong>Company Size:</strong> {job.Company_Size}</p>
                <p><strong>AI Adoption:</strong> {job.AI_Adoption_Level}</p>
                <p><strong>Automation Risk:</strong> {job.Automation_Risk}</p>
                <p><strong>Salary:</strong> ${parseInt(job.Salary_USD).toLocaleString()}</p>
                <p><strong>Remote Friendly:</strong> {job.Remote_Friendly}</p>
                <p className={`growth-tag ${job.Job_Growth_Projection.toLowerCase()}`}>
                  {job.Job_Growth_Projection}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPrediction;
