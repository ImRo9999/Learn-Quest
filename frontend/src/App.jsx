import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import ProtectedRoute from "./components/protectedroute";
import SidebarLayout from "./components/SidebarLayout";
import DashboardHome from "./pages/dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import PersonalizedRecommendations from "./pages/PersonalizedRecommendations";
import LinkedinCallback from "./pages/LinkedinCallback";
import JobPrediction from "./pages/jobPrediction";


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/linkedin-callback" element={<LinkedinCallback />} />

        {/* Protected Route with nested children */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SidebarWrapper />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="upload-resume" element={<ResumeUpload />} />
          <Route path="personalized-recommendations" element={<PersonalizedRecommendations/>} />
          <Route path="job-prediction" element={<JobPrediction />} />
        </Route>
      </Routes>
    </Router>
  );
};

const SidebarWrapper = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return <SidebarLayout handleLogout={handleLogout} />;
};

export default App;
