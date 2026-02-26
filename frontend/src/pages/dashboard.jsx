import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [jobInput, setJobInput] = useState("");
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const navigate = useNavigate();

  const handleCheckboxChange = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const fetchCompletedCourses = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/courses/coursera/completed", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCompletedCourses(res.data || []);
    } catch (err) {
      console.error("Fetch completed courses error:", err);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/courses/coursera/recommended?job=${user.jobTitle}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const allRecommended = Array.isArray(res.data.coursesFromAPI)
        ? res.data.coursesFromAPI
        : [];

      const completedIds = new Set(completedCourses.map((course) => course.courseId));
      const filteredCourses = allRecommended.filter((course) => {
        const id = course.courseId || course.id;
        return !completedIds.has(id);
      });

      setRecommendedCourses(filteredCourses);
    } catch (err) {
      console.error("Fetch recommended courses error:", err);
      setRecommendedCourses([]);
    }
  }, [user, completedCourses]);

  const markCoursesAsCompleted = async () => {
    try {
      const selectedDetails = recommendedCourses.filter((c) =>
        selectedCourses.includes(c.courseId || c.id)
      );

      await axios.post(
        "http://localhost:5001/api/courses/courses/mark-completed",
        {
          courseIds: selectedCourses,
          courseDetails: selectedDetails,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      await fetchCompletedCourses();
      await fetchCourses();
      setSelectedCourses([]);
    } catch (err) {
      console.error("Error marking courses as completed", err);
    }
  };

  const handleJobTitleSave = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/dashboard/job-title",
        { jobTitle: jobInput },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser((prev) => ({ ...prev, jobTitle: jobInput }));
      setEditMode(false);
      fetchCourses(); // refresh recommendations after update
    } catch (err) {
      console.error("Error updating job title", err);
    }
  };
  const handleLinkedInLogin = () => {
    const clientId = "77d7wcuy20g5l6";
    const redirectUri = "http://localhost:3000/linkedin-callback";
    const scope = "openid profile email";
    const appToken = localStorage.getItem("token");
  
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${appToken}`;
  
    window.location.href = authUrl;
  };
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await axios.get("http://localhost:5001/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
        setJobInput(res.data.jobTitle || "");
      } catch (err) {
        console.error("Fetch user error:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchCompletedCourses();
    }
  }, [user, fetchCompletedCourses]);

  useEffect(() => {
    if (user && completedCourses.length >= 0) {
      fetchCourses();
    }
  }, [user, completedCourses, fetchCourses]);

  return (
    <div className="dashboard">
      {/* User Info */}
      {user && (
        <div className="user-info">
          <h2>Welcome, {user.name}</h2>
          <p>Email: {user.email}</p>
          <div className="job-title-section">
  <strong>Job Title:</strong>
  {editMode ? (
    <>
      <input
        className="job-input"
        value={jobInput}
        onChange={(e) => setJobInput(e.target.value)}
        placeholder="Enter job title"
      />
      <button className="save-btn" onClick={handleJobTitleSave}>Save</button>
      <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
    </>
  ) : (
    <div className="job-display">
      <span>{user.jobTitle || "Not Available"}</span>
      <i
        className="fa-solid fa-pen-to-square edit-icon"
        onClick={() => setEditMode(true)}
        title="Edit Job Title"
      ></i>
    </div>
  )}
</div>
<div className="linkedin-section">
  <button className="linkedin-button" onClick={handleLinkedInLogin}>
    <i className="fa-brands fa-linkedin linkedin-icon"></i> Connect LinkedIn
  </button>
</div>

        </div>
      )}

      {/* Recommended Courses */}
      <div className="courses-container">
        <h2>Recommended Courses</h2>
        {recommendedCourses.length === 0 ? (
          <p>No courses found</p>
        ) : (
          <>
            <div className="course-grid">
              {recommendedCourses.map((course) => (
                <div key={course._id || course.id} className="course-card">
                  <input
                    type="checkbox"
                    className="course-checkbox"
                    checked={selectedCourses.includes(course.courseId || course.id)}
                    onChange={() => handleCheckboxChange(course.courseId || course.id)}
                  />
                  {course.photoUrl && (
                    <img
                      src={course.photoUrl}
                      alt={course.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  )}
                  <strong>{course.name}</strong>
                  <p>{course.description?.slice(0, 100) || "No description available."}</p>
                  {course.slug && (
                    <a
                      href={`https://www.coursera.org/learn/${course.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Course
                    </a>
                  )}
                </div>
              ))}
            </div>

            {selectedCourses.length > 0 && (
              <button className="complete-button" onClick={markCoursesAsCompleted}>
                Mark Selected as Completed
              </button>
            )}
          </>
        )}
      </div>

      {/* Completed Courses */}
      <div className="completed-container">
        <h2>Your Completed Courses</h2>
        {completedCourses.length === 0 ? (
          <p>No completed courses</p>
        ) : (
          <div className="course-grid">
            {completedCourses.map((course) => (
              <div key={course._id} className="course-card completed">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                )}
                <strong>{course.name}</strong>
                <p>{course.description?.slice(0, 100) || "No description available."}</p>
                {course.slug && (
                  <a
                    href={`https://www.coursera.org/learn/${course.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Course
                  </a>
                )}
                <p>Completed on: {new Date(course.completionDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
