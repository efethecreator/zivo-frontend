// File: zivo/services/api.ts
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { router } from "expo-router";
import { SecureStoreService, getApiUrl } from "./secureStore.service";

// Global logout state
export let isLoggedOut = false;

// Axios instance'ını saklayacak değişken
let axiosInstance: AxiosInstance | null = null;

// Logout durumunu ayarlamak için fonksiyon
export const setLogoutState = (state: boolean) => {
  isLoggedOut = state;
  console.log(`🔒 API istekleri ${state ? "engellendi" : "etkinleştirildi"}`);

  // Eğer logout yapılıyorsa, axios instance'ını yeniden oluştur
  if (state) {
    resetAxiosInstance();
  }
};

// Axios instance'ını sıfırlamak için fonksiyon
export const resetAxiosInstance = () => {
  console.log("🔄 Axios instance sıfırlanıyor...");
  axiosInstance = null;
  createAxiosInstance();
};

// Axios instance'ını oluşturmak için fonksiyon
export const createAxiosInstance = (): AxiosInstance => {
  if (!axiosInstance) {
    console.log("🔨 Yeni Axios instance oluşturuluyor...");
    axiosInstance = axios.create({
      baseURL: getApiUrl(),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // Eğer logout durumundaysak ve auth ile ilgili olmayan bir istek ise engelle
          if (isLoggedOut && !config.url?.includes("/auth/login")) {
            console.log(
              `🛑 Logout durumunda API isteği engellendi: ${config.url}`
            );
            // İsteği iptal et
            return Promise.reject({
              message: "User is logged out",
              isLogoutRelated: true,
            });
          }

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

    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response) => {
        console.log("[API] ✅ Yanıt alındı:", {
          url: response.config.url,
          status: response.status,
        });
        return response;
      },
      async (error) => {
        // Logout ile ilgili hataları sessizce geç
        if (error.isLogoutRelated) {
          console.log("🔇 Logout ile ilgili hata sessizce geçildi");
          return new Promise(() => {}); // İsteği askıda bırak
        }

        // Eğer axios iptal edildiyse, sessizce geç
        if (axios.isCancel(error)) {
          console.log("🔇 Axios isteği iptal edildi");
          return new Promise(() => {}); // İsteği askıda bırak
        }

        console.error("[API] ❌ API yanıt hatası:", {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data,
        });

        if (error.response?.status === 401) {
          console.warn("[API] ⚠️ 401 Unauthorized - Token siliniyor.");

          // Eğer auth/login isteği değilse ve logout durumunda değilsek
          if (!error.config?.url?.includes("/auth/login") && !isLoggedOut) {
            console.warn(
              "[API] ⚠️ 401 Unauthorized - Login'e yönlendiriliyor."
            );
            setLogoutState(true); // Önce logout durumunu ayarla
            await SecureStoreService.removeItem("zivo_token");
            await SecureStoreService.removeItem("zivo_user");
            router.replace("/auth/login");
          }
        }

        return Promise.reject(error);
      }
    );
  }

  return axiosInstance;
};

// API fonksiyonu - Her çağrıda güncel axios instance'ını kullanır
const api = {
  get: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    const instance = createAxiosInstance();
    return instance.get<T>(url, config);
  },
  post: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    const instance = createAxiosInstance();
    return instance.post<T>(url, data, config);
  },
  put: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    const instance = createAxiosInstance();
    return instance.put<T>(url, data, config);
  },
  delete: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    const instance = createAxiosInstance();
    return instance.delete<T>(url, config);
  },
  patch: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    const instance = createAxiosInstance();
    return instance.patch<T>(url, data, config);
  },
};

// İlk instance'ı oluştur
createAxiosInstance();

export default api;
