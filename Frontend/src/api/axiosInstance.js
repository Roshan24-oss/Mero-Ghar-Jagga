import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000/api"
    : "https://api.helloworld.com/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;