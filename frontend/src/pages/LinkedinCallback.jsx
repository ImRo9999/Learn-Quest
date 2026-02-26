import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LinkedInCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const appToken = params.get("state");  // ✅ Read JWT from state param

      if (!code || !appToken) {
        console.error("Authorization code or token missing");
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:5001/api/linkedin/auth/linkedin",
          { code },
          {
            headers: { Authorization: `Bearer ${appToken}` }, // ✅ Pass JWT in header
          }
        );

        const { token } = res.data;
        if (token) {
          localStorage.setItem("token", token);
          navigate("/dashboard");
        } else {
          console.error("No token received");
        }
      } catch (err) {
        console.error("LinkedIn callback error:", err.response?.data || err.message);
      }
    };

    exchangeCodeForToken();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Processing LinkedIn login...</h2>
    </div>
  );
};

export default LinkedInCallback;
