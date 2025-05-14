// src/utils/api.ts
// Interceptor: Token ekleme
import axios from "axios";
import { Platform } from "react-native";
import { router } from "expo-router";
import { getApiUrl, SecureStoreService } from "../services/secureStore.service";

// Axios instance
export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Token ekleme + log
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStoreService.getItem("zivo_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("[API] ✅ Token eklendi:", token.slice(0, 10) + "...");
      } else {
        console.warn(
          "[API] ⚠️ Token bulunamadı, Authorization header eklenmedi."
        );
      }

      const fullUrl = `${config.baseURL ?? ""}${config.url ?? ""}`;
      console.log("[API] 📤 İstek gönderiliyor:", {
        method: config.method,
        url: fullUrl,
        headers: config.headers,
      });

      return config;
    } catch (err) {
      console.error("[API] ❌ Token alma hatası:", err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Hata loglama + yönlendirme
api.interceptors.response.use(
  (response) => {
    console.log("[API] ✅ Yanıt alındı:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    console.error("[API] ❌ API Error Details:", {
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

    // Only redirect to login for 401 errors (unauthorized)
    if (error.response?.status === 401) {
      console.warn("[API] ⚠️ 401 Unauthorized - Token siliniyor.");
      await SecureStoreService.removeItem("zivo_token");
      await SecureStoreService.removeItem("zivo_user");
      router.replace("/auth/login");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });

    const { token, user } = response.data;

    if (token) {
      console.log("[AUTH] ✅ Token geldi:", token.slice(0, 10) + "...");
      await SecureStoreService.setItem("zivo_token", token);
      await SecureStoreService.setItem("zivo_user", JSON.stringify(user));
      console.log("[AUTH] ✅ Token ve user SecureStore'a kaydedildi.");
    } else {
      console.warn("[AUTH] ⚠️ Token login yanıtında yok.");
    }

    return response.data;
  },
  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    userType: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },
  updateProfile: async (userData: any) => {
    const response = await api.put("/user/profile", userData);
    return response.data;
  },
};

// Appointment API
export const appointmentApi = {
  getAppointments: async () => {
    try {
      const response = await api.get("/appointments/my");
      return response.data;
    } catch (error) {
      console.error("[Appointments] Failed to get appointments:", error);
      return [];
    }
  },
  createAppointment: async (appointmentData: any) => {
    const response = await api.post("/appointments", appointmentData);
    return response.data;
  },
  cancelAppointment: async (appointmentId: string) => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },
};

export default api;
