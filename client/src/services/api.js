import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach JWT token to every API request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized requests
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized API request:", error.config?.url);
    }

    return Promise.reject(error);
  }
);

export default API;