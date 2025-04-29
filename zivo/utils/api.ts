import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router";
import { Platform } from "react-native";

// Backend URL - değiştirilmesi gerekiyor
const BACKEND_URL = "http://localhost:4000/api/v1" // TODO: Gerçek backend URL'nizi buraya ekleyin

// Create an axios instance with default config
export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@zivo_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor for error handling
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

// Auth related API calls
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/v1/auth/login", { email, password })
    return response.data
  },
  register: async (userData: {
    fullName: string
    email: string
    password: string
    userType: string
  }) => {
    const response = await api.post("/v1/auth/register", userData)
    return response.data
  },
  logout: async () => {
    const response = await api.post("/v1/auth/logout")
    return response.data
  },
}

// Kullanıcı profili ile ilgili API çağrıları
export const userApi = {
  getProfile: async () => {
    const response = await api.get("/v1/user/profile")
    return response.data
  },
  updateProfile: async (userData: any) => {
    const response = await api.put("/v1/user/profile", userData)
    return response.data
  },
}

// Randevu işlemleri ile ilgili API çağrıları
export const appointmentApi = {
  getAppointments: async () => {
    const response = await api.get("/v1/appointments")
    return response.data
  },
  createAppointment: async (appointmentData: any) => {
    const response = await api.post("/v1/appointments", appointmentData)
    return response.data
  },
  cancelAppointment: async (appointmentId: string) => {
    const response = await api.delete(`/v1/appointments/${appointmentId}`)
    return response.data
  },
}

// Export the api instance for other API calls
export default api

