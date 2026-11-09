import axios from "axios";
import { API_BASE_URL } from "@/constants/api";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("zse_training_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if an expired session token failed on an internal authenticated page.
    // NEVER redirect if the user is already on /login or if the login request itself returned 401!
    const isAuthEndpoint = error.config?.url?.includes("/login") || error.config?.url?.includes("/register");
    if (error.response?.status === 401 && !isAuthEndpoint && window.location.pathname !== "/login") {
      localStorage.removeItem("zse_training_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
