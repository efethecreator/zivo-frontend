// services/auth.service.ts

import { useMutation } from "@tanstack/react-query";
import api from "./api";
import { SecureStoreService } from "./secureStore.service";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

export interface LoginResponse {
  token: string;
  user: any;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (userData: {
  fullName: string;
  email: string;
  password: string;
  userType: "customer" | "business" | "store_owner" | "admin";
}): Promise<LoginResponse> => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const logout = async (): Promise<void> => {
  // Token kontrolü yap, yoksa istek gönderme
  const token = await SecureStoreService.getItem("zivo_token");
  if (!token) {
    console.log("[Auth] ℹ️ Token yok, logout isteği gönderilmiyor.");
    return;
  }

  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("[Auth] ❌ Logout API isteği başarısız:", error);
    // Hata olsa bile devam et, önemli olan client-side logout
  }
};

export const getCurrentUser = async (): Promise<any | null> => {
  try {
    // Token kontrolü yap, yoksa istek gönderme
    const token = await SecureStoreService.getItem("zivo_token");
    if (!token) {
      console.log("[Auth] ℹ️ Token yok, getCurrentUser isteği gönderilmiyor.");
      return null;
    }

    const userJson = await SecureStoreService.getItem("zivo_user");
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// fetchCurrentUser fonksiyonunu güncelleyelim
export const fetchCurrentUser = async (): Promise<any> => {
  // Token kontrolü yap, yoksa istek gönderme
  const token = await SecureStoreService.getItem("zivo_token");
  if (!token) {
    console.log("[Auth] ℹ️ Token yok, fetchCurrentUser isteği gönderilmiyor.");
    throw new Error("No token available");
  }

  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("[Auth] ❌ fetchCurrentUser hatası:", error);
    throw error;
  }
};

export const useLoginMutation = () => {
  const { invalidateAll } = useInvalidateAppData();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      login(data.email, data.password),
    onSuccess: () => {
      // Kullanıcı giriş yaptığında tüm verileri yenile
      invalidateAll();
    },
  });
};

export const useRegisterMutation = () => {
  const { invalidateAll } = useInvalidateAppData();

  return useMutation({
    mutationFn: (data: {
      fullName: string;
      email: string;
      password: string;
      userType: "customer" | "business" | "store_owner" | "admin";
    }) => register(data),
    onSuccess: () => {
      // Kullanıcı kayıt olduğunda tüm verileri yenile
      invalidateAll();
    },
  });
};

export const useLogoutMutation = () => {
  const { invalidateAll } = useInvalidateAppData();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Kullanıcı çıkış yaptığında tüm verileri yenile
      invalidateAll();
    },
  });
};

export const useFetchCurrentUserMutation = () => {
  const { invalidateProfile } = useInvalidateAppData();

  return useMutation({
    mutationFn: fetchCurrentUser,
    onSuccess: () => {
      // Kullanıcı bilgileri güncellendiğinde profil verilerini yenile
      invalidateProfile();
    },
  });
};
