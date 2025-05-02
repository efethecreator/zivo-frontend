// File: zivo/services/api.ts
import axios from "axios";
import { router } from "expo-router";
import { SecureStoreService, getApiUrl } from "./secureStore.service";

// ✅ Axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor: Token ekleme ve loglama
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

      const fullUrl = (config.baseURL ?? "") + (config.url ?? "");
      console.log("[API] 📤 İstek gönderiliyor:", {
        method: config.method,
        url: fullUrl,
        headers: config.headers,
      });

      return config;
    } catch (err) {
      console.error("[API] ❌ Token alma sırasında hata:", err);
      return config;
    }
  },
  (error) => {
    console.error("[API] ❌ Request interceptor hatası:", error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor: Hata yakalama ve yönlendirme
api.interceptors.response.use(
  (response) => {
    console.log("[API] ✅ Yanıt alındı:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    console.error("[API] ❌ API yanıt hatası:", {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.warn(
        "[API] ⚠️ 401 Unauthorized - Token siliniyor ve login'e yönlendiriliyor."
      );
      await SecureStoreService.removeItem("zivo_token");
      await SecureStoreService.removeItem("zivo_user");
      router.replace("/auth/login");
    }

    return Promise.reject(error);
  }
);

export default api;
