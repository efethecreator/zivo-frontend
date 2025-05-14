import axios from "axios";
import { Platform } from "react-native";
import { router } from "expo-router";
import { getApiUrl, SecureStoreService } from "../services/secureStore.service";

// Axios instance (baseURL tanımlamıyoruz)
export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Token gerektirmeyen endpoint'lerin listesi
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Request Interceptor: Dynamic BaseURL + Token ekleme + log
api.interceptors.request.use(
  async (config) => {
    // ✅ Her istekte güncel baseURL al
    config.baseURL = getApiUrl();

    try {
      // Endpoint'in token gerektirip gerektirmediğini kontrol et
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
        config.url?.includes(endpoint)
      );

      // SecureStore'dan token al
      const token = await SecureStoreService.getItem("zivo_token");

      // Eğer token yoksa ve public endpoint değilse, isteği iptal et
      if (!token && !isPublicEndpoint) {
        console.warn(
          "[API] ⚠️ Token bulunamadı, istek iptal ediliyor:",
          config.url
        );

        // İsteği iptal et
        const controller = new AbortController();
        controller.abort();

        // Axios'a isteğin iptal edildiğini bildir
        return {
          ...config,
          signal: controller.signal,
        };
      }

      // Token varsa ekle (public endpoint olsa bile ekleyebiliriz)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("[API] ✅ Token eklendi:", token.slice(0, 10) + "...");
      } else if (isPublicEndpoint) {
        console.log("[API] ℹ️ Public endpoint, token gerekmez:", config.url);
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
    // İstek iptal edildiyse, detaylı log yazmaya gerek yok
    if (axios.isCancel(error)) {
      console.log("[API] ℹ️ İstek iptal edildi:", error.message);
      return Promise.reject(error);
    }

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

    // Çıkış işlemi sırasında 401 hatalarını yok sayalım
    const isLogoutInProgress = error.config?.url?.includes("/auth/logout");
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      error.config?.url?.includes(endpoint)
    );

    // Only redirect to login for 401 errors (unauthorized) and not during logout or public endpoints
    if (
      error.response?.status === 401 &&
      !isLogoutInProgress &&
      !isPublicEndpoint
    ) {
      // Önce token kontrolü yapalım
      const token = await SecureStoreService.getItem("zivo_token");

      // Eğer token zaten yoksa, yönlendirmeye gerek yok
      if (token) {
        console.warn("[API] ⚠️ 401 Unauthorized - Token siliniyor.");
        await SecureStoreService.removeItem("zivo_token");
        await SecureStoreService.removeItem("zivo_user");
        router.replace("/auth/login");
      } else {
        console.log(
          "[API] ℹ️ 401 alındı ama token zaten yok, yönlendirme yapılmıyor."
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;
