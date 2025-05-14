"use client";

// hooks/useAuthGuard.ts
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

/**
 * Bu hook, oturum açmış kullanıcıları korur
 * ve oturum açılmamışsa login sayfasına yönlendirir
 */
export function useAuthGuard() {
  const { tokenAvailable, isLoading, loggingOut } = useAuth();

  useEffect(() => {
    // Eğer çıkış yapılıyorsa, hiçbir şey yapma
    if (loggingOut) return;

    // Yükleme tamamlandıysa ve token yoksa, login sayfasına yönlendir
    if (!isLoading && tokenAvailable === false) {
      console.log("[AuthGuard] 🔒 Token yok, login sayfasına yönlendiriliyor");
      router.replace("/auth/login");
    }
  }, [tokenAvailable, isLoading, loggingOut]);
}
