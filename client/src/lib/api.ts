import axios from "axios";

// Common Axios instance with predefined base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_APP_URL + "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach authorization token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally (e.g., unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect if unauthorized (except during login check)
      const isLoginOrMeRequest =
        error.config.url?.includes("/auth/login") ||
        error.config.url?.includes("/auth/register");

      if (!isLoginOrMeRequest) {
        localStorage.removeItem("token");
        // We let the auth context/router handle redirection
      }
    }
    return Promise.reject(error);
  },
);

export default api;
