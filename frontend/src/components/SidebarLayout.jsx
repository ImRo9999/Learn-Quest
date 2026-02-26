import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import "../styles/dashboard.css";

const SidebarLayout = ({ user, handleLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="left-nav">
          <FaBars className="menu-icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <h1 className="app-name">LearnQuest</h1>
        </div>
        <div className="right-nav">
          <FaUserCircle className="profile-icon" />
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
        <Link to="/dashboard/upload-resume" onClick={() => setIsSidebarOpen(false)}>Resume</Link>
        <Link to="/dashboard/personalized-recommendations" onClick={() => setIsSidebarOpen(false)}>Personalized Recommendations</Link>
        <Link to="/dashboard/job-prediction" onClick={() => setIsSidebarOpen(false)}>Job Analytics</Link>
        <Link to="/dashboard/profile" onClick={() => setIsSidebarOpen(false)}>Profile</Link>
      </div>

      {/* Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
