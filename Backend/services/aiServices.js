import axios from "axios";

const AI_SERVICE_URL = "http://127.0.0.1:5000/predict";

export const predictPopularity = async (propertyData) => {
  try {
    const response = await axios.post(
      AI_SERVICE_URL,
      propertyData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data.popularityScore;
  } catch (error) {
    console.error(
      "AI popularity prediction failed:",
      error.response?.data || error.message
    );

    return null;
  }
};