import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const resumeApi = axios.create({
  baseURL: `${API_URL}/resume`,
  timeout: 180000,
});

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

resumeApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const uploadResume = async (file) => {
  if (!file) {
    throw new Error("Please select a PDF resume.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Resume must be smaller than 5 MB.");
  }

  const formData = new FormData();

  formData.append("resume", file);

  const response = await resumeApi.post(
    "/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getResumeHistory = async () => {
  const response =
    await resumeApi.get("/history");

  return response.data;
};

export const getResumeById = async (id) => {
  if (!id) {
    throw new Error("Resume ID is required.");
  }

  const response =
    await resumeApi.get(`/${id}`);

  return response.data;
};

export const deleteResume = async (id) => {
  if (!id) {
    throw new Error("Resume ID is required.");
  }

  const response =
    await resumeApi.delete(`/${id}`);

  return response.data;
};

export default resumeApi;