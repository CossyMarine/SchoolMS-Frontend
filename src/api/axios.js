// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true,
});

delete API.defaults.headers.common["Content-Type"];
delete API.defaults.headers.post["Content-Type"];
delete API.defaults.headers.patch["Content-Type"];
delete API.defaults.headers.put["Content-Type"];

API.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = undefined;
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const isMeCheck = error.config?.url?.includes("/auth/me");
    if (error.code === "ECONNABORTED" || !error.response) {
      console.warn("Network error or timeout:", error.message);
    } else if (error.response?.status === 401 && !isMeCheck) {
      if (window.location.pathname !== "/login") window.location.href = "/login";
    } else if (error.response?.status !== 401) {
      console.error("API Error:", error?.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
