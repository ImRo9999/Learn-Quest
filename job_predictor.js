// job_predictor.js
const csv = require("csvtojson");
const path = require("path");

let jobs = [];

const loadJobs = async () => {
  const filePath = path.join(__dirname, "cleaned_ai_job_market_insights.csv");
  jobs = await csv().fromFile(filePath);
};

const predictJobs = (skills) => {
  if (!skills.length) return [];

  const userSkills = skills.map(skill => skill.toLowerCase());

  const scoredJobs = jobs.map(job => {
    const requiredSkills = job.Required_Skills.split(" ");
    const matchCount = requiredSkills.filter(skill => userSkills.includes(skill)).length;
    return { ...job, matchCount };
  });

  return scoredJobs
    .filter(job => job.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount || b.Salary_USD - a.Salary_USD)
    .slice(0, 5); // Top 5 matches
};

module.exports = { loadJobs, predictJobs };
