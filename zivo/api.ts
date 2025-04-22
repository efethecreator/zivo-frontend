import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./constants";
import { router } from "expo-router";
import { Platform } from "react-native";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem("@zivo_token");
    console.log("Current token:", token); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log detailed error information
    console.error("API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers,
      },
      message: error.message,
      code: error.code,
      platform: Platform.OS,
    });

    if (error.response?.status === 401) {
      console.log("Unauthorized access detected");
      await AsyncStorage.removeItem("@zivo_token");
      await AsyncStorage.removeItem("@zivo_user");
      router.replace("/auth/login");
    }
    return Promise.reject(error);
  }
);

export default api; 