require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const linkedinRoutes = require('./routes/linkedin');
const courseraRoutes = require('./routes/coursera');
const jobPredictorRoutes = require("./routes/jobPredictor");
const path = require("path");


const app = express();
app.use(express.json());
app.use(cors());
const uploadRoutes = require("./routes/upload");
// Routes
app.use('/', authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/courses", courseraRoutes); 
app.use("/resumes", express.static(path.join(__dirname, "uploads/resumes")));
app.use("/api/upload", uploadRoutes);
app.use("/api/linkedin", linkedinRoutes);
app.use("/api/job-predictor", jobPredictorRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
