import axios from "axios";

const api = axios.create({
  baseURL: "https://mrm1jocp20.execute-api.us-east-1.amazonaws.com/dev",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {

  // ✅ USE ID TOKEN
  const token = localStorage.getItem("idToken");

  if (token) {
    config.headers.Authorization = token;
    // ❌ NO Bearer
  }

  return config;
});

export default api;
