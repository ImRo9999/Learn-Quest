const axios = require("axios");
require("dotenv").config();

const getCourseraAccessToken = async () => {
  const clientId = process.env.COURSERA_API_KEY;
  const clientSecret = process.env.COURSERA_API_SECRET;
  const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post(
    "https://api.coursera.com/oauth2/client_credentials/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${base64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

const fetchRecommendedCourses = async (queryList, limitPerKeyword = 1) => {
  try {
    const token = await getCourseraAccessToken();
    const recommendedCourses = [];

    for (const keyword of queryList) {
      const searchRes = await axios.get("https://api.coursera.org/api/courses.v1", {
        params: { q: "search", query: keyword },
        headers: { Authorization: `Bearer ${token}` },
      });

      const courseIds = searchRes.data.elements.map((c) => c.id);
      if (courseIds.length === 0) continue;

      const detailsRes = await axios.get("https://api.coursera.org/api/courses.v1", {
        params: {
          ids: courseIds.slice(0, limitPerKeyword).join(","),
          fields: "photoUrl,description,slug,name",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      for (const c of detailsRes.data.elements) {
        if (!recommendedCourses.find((course) => course.courseId === c.id)) {
          recommendedCourses.push({
            courseId: c.id,
            name: c.name,
            description: c.description,
            slug: c.slug,
            photoUrl: c.photoUrl,
          });
        }
      }
    }

    return recommendedCourses;
  } catch (err) {
    console.error("❌ Failed to fetch Coursera courses:", err.message);
    return [];
  }
};

module.exports = fetchRecommendedCourses;
