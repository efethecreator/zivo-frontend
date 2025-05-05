"use client";

import type React from "react";
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { SecureStoreService } from "../services/secureStore.service";
import type { User } from "../services/user.service";
import {
  login as apiLogin,
  register as apiRegister,
} from "../services/auth.service";
import { router } from "expo-router";
import { Alert, AppState, type AppStateStatus } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { setLogoutState, resetAxiosInstance } from "../services/api";

type AuthContextType = {
  user: User | null;
  login: (userData: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    fullName: string;
    email: string;
    password: string;
    userType: "customer" | "business" | "store_owner" | "admin";
  }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
  resetAuth: () => Promise<void>;
  refreshUserState: () => Promise<void>;
};

// Use null! to tell TypeScript we'll handle the null case
const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Kullanıcı durumunu SecureStore'dan yenile
  const refreshUserState = useCallback(async () => {
    try {
      console.log("🔄 Kullanıcı durumu yenileniyor...");
      const userJson = await SecureStoreService.getItem("zivo_user");
      const token = await SecureStoreService.getItem("zivo_token");

      if (userJson && token) {
        const parsedUser = JSON.parse(userJson);
        console.log("👤 Kullanıcı durumu yenilendi:", parsedUser.email);
        setUser(parsedUser);
        // API isteklerini etkinleştir
        setLogoutState(false);
      } else {
        console.log("⚠️ Kullanıcı bilgisi bulunamadı, state temizleniyor");
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Kullanıcı durumu yenilenirken hata:", error);
      setUser(null);
    }
  }, []);

  // AppState değişikliklerini izle
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          console.log(
            "🔄 Uygulama aktif oldu, kullanıcı durumu yenileniyor..."
          );
          refreshUserState();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [refreshUserState]);

  // Auth durumunu tamamen sıfırla
  const resetAuth = async () => {
    console.log("🔄 Auth durumu sıfırlanıyor...");

    // Önce state'i temizle
    setUser(null);

    // Sonra storage'ı temizle
    await SecureStoreService.removeItem("zivo_token");
    await SecureStoreService.removeItem("zivo_user");

    // Query cache'i temizle
    queryClient.clear();
    console.log("🧹 Query cache temizlendi");

    // Kontrol için tekrar oku
    const token = await SecureStoreService.getItem("zivo_token");
    const userJson = await SecureStoreService.getItem("zivo_user");
    console.log("🧪 Reset sonrası token:", token);
    console.log("🧪 Reset sonrası user:", userJson);
  };

  useEffect(() => {
    // Check if user is already logged in
    const loadUser = async () => {
      try {
        await refreshUserState();
      } catch (error) {
        console.error("❌ Failed to load user from storage", error);
        await resetAuth(); // Hata durumunda sıfırla
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [refreshUserState]);

  const handleLogin = async (userData: { email: string; password: string }) => {
    try {
      console.log("🔑 Login attempt for:", userData.email);

      // Önce mevcut durumu tamamen temizle
      await resetAuth();

      // API isteklerini etkinleştir
      setLogoutState(false);

      // Login işlemini gerçekleştir
      const response = await apiLogin(userData.email, userData.password);
      const { token, user } = response;

      console.log("✅ Login successful for:", user.email);

      // Önce token'ı kaydet
      await SecureStoreService.setItem("zivo_token", token);

      // Sonra kullanıcı bilgilerini kaydet
      await SecureStoreService.setItem("zivo_user", JSON.stringify(user));

      // En son state'i güncelle
      console.log("👤 Setting user state after login:", user.email);
      setUser(user);

      // Query cache'i temizle
      queryClient.clear();
      console.log("🧹 Query cache temizlendi");

      // Kontrol için
      const storedToken = await SecureStoreService.getItem("zivo_token");
      const storedUser = await SecureStoreService.getItem("zivo_user");
      console.log("🧪 Login sonrası token:", storedToken ? "exists" : "null");
      console.log(
        "🧪 Login sonrası user:",
        storedUser ? JSON.parse(storedUser).email : "null"
      );

      // Kısa bir gecikme ekle
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log(
        `✅ ${user.email} hesabına giriş başarılı, yönlendiriliyor...`
      );
    } catch (error) {
      console.error("❌ Login failed", error);
      Alert.alert(
        "Hata",
        "Giriş başarısız. Lütfen bilgilerinizi kontrol edin."
      );
      throw error;
    }
  };

  const handleRegister = async (userData: {
    fullName: string;
    email: string;
    password: string;
    userType: "customer" | "business" | "store_owner" | "admin";
  }) => {
    try {
      await apiRegister(userData);
      // Başarılı kayıt sonrası login sayfasına yönlendir
      router.replace("/auth/login");
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Çıkış yapılıyor...");

      // API isteklerini engelle - Bu çok önemli, hemen ilk adımda engelle
      setLogoutState(true);

      // Axios instance'ını sıfırla
      resetAxiosInstance();

      // Önce state'i temizle
      setUser(null);

      // Query cache'i temizle
      queryClient.clear();
      console.log("🧹 Query cache temizlendi");

      // Sonra storage'ı temizle
      await SecureStoreService.removeItem("zivo_token");
      await SecureStoreService.removeItem("zivo_user");

      // Kontrol için
      const token = await SecureStoreService.getItem("zivo_token");
      const userJson = await SecureStoreService.getItem("zivo_user");
      console.log("🧪 Logout sonrası token:", token);
      console.log("🧪 Logout sonrası user:", userJson);

      console.log("✅ User logged out.");

      // Daha uzun bir gecikme ekle - Yönlendirmeden önce tüm işlemlerin tamamlanması için
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Yönlendirme
      router.replace("/auth/login");
    } catch (error) {
      console.error("❌ Logout failed", error);
      // Hata olsa bile login sayfasına yönlendir
      router.replace("/auth/login");
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return;

      // Update user data
      const updatedUser: User = {
        ...user,
        ...userData,
      };

      setUser(updatedUser);
      await SecureStoreService.setItem(
        "zivo_user",
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.error("Failed to update user", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isLoading,
        updateUser,
        resetAuth,
        refreshUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
