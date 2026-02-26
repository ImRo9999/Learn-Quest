import React, { useState, useEffect } from "react";
import "../styles/resumeupload.css";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [summary, setSummary] = useState(null);


  // Fetch existing resume on mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/upload/resume", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        const data = await res.json();
  
        if (res.ok) {
          if (data.resumePath) {
            setDownloadLink(`http://localhost:5001/${data.resumePath}`);
          }
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      } catch (err) {
        console.error("Error fetching existing resume:", err);
      }
    };
  
    fetchResume();
  }, []);
  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploading(true);
      const res = await fetch("http://localhost:5001/api/upload/resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Resume uploaded successfully!");
        setDownloadLink(`http://localhost:5001/${data.resumePath}`);
        setSummary(data.summary);  // 👈 Add this
      }
       else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-upload-page">
      <h2>Upload Your Resume</h2>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="upload-message">{message}</p>}
      {downloadLink && (
        <p className="download-link">
          📄{" "}
          <a href={downloadLink} target="_blank" rel="noopener noreferrer">
            View / Download Resume
          </a>
        </p>
      )}
      {summary && (
  <div className="resume-summary">
    <h3>Profile Summary</h3>
    <p><strong>Skills:</strong> {summary.skills || "Not found"}</p>
    <p><strong>Experience:</strong></p>
<ul>
  {(Array.isArray(summary.experience) ? summary.experience : [summary.experience])
    .filter(Boolean)
    .map((exp, idx) => (
      <li key={idx}>{exp}</li>
    ))}
</ul>



    <p><strong>Education:</strong> {summary.education || "Not found"}</p>
    {summary.skillExperience && (
  <div>
    <p><strong>Skill Experience:</strong></p>
    <ul>
      {summary.skillExperience.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
)}
  </div>
)}

    </div>
  );
};

export default ResumeUpload;
