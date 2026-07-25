

// src/api/axios.ts
import axios, { InternalAxiosRequestConfig } from "axios";
import { getAccessToken } from "@/lib/token";
import { clearAuthStorage } from "@/lib/auth";

const axiosInstance = axios.create({
  baseURL: "https://z4f6lxvp-8001.asse.devtunnels.ms",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Tunnel-Skip-AntiPhishing-Page": "true",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined") {
        clearAuthStorage();
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;