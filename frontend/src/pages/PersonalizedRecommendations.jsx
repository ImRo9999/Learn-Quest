// pages/PersonalizedRecommendations.jsx
import React, { useEffect, useState } from "react";

const PersonalizedRecommendations = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch("http://localhost:5001/api/upload/resume", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.summary?.recommendedCourses) {
        setCourses(data.summary.recommendedCourses);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="recommendations-page">
      <h2>Personalized Course Recommendations</h2>
      <div className="course-grid">
        {courses.length === 0 ? (
          <p>No recommendations yet. Try uploading your resume!</p>
        ) : (
          courses.map((course) => (
            <div key={course.courseId} className="course-card">
              {course.photoUrl && (
                <img src={course.photoUrl} alt={course.name} />
              )}
              <h4>{course.name}</h4>
              <p>{course.description?.slice(0, 100)}...</p>
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
          ))
        )}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;
