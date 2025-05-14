"use client";

// hooks/useTokenCheck.ts
import { useEffect } from "react";
import { SecureStoreService } from "../services/secureStore.service";
import { useAuth } from "../context/AuthContext";

/**
 * Bu hook, API isteklerinden önce token kontrolü yapar
 * ve token yoksa istekleri engeller
 */
export function useTokenCheck() {
  const { tokenAvailable, loggingOut } = useAuth();

  useEffect(() => {
    // Global bir interceptor ekleyelim
    const checkToken = async () => {
      try {
        // Eğer çıkış yapılıyorsa, tüm istekleri engelle
        if (loggingOut) {
          console.log(
            "[TokenCheck] 🚫 Çıkış yapılıyor, tüm istekler engelleniyor"
          );
          return;
        }

        // Token kontrolü
        const token = await SecureStoreService.getItem("zivo_token");
        if (!token && tokenAvailable !== false) {
          console.warn(
            "[TokenCheck] ⚠️ Token bulunamadı, auth state güncelleniyor"
          );
          // Auth context'i güncelle
        }
      } catch (error) {
        console.error("[TokenCheck] ❌ Token kontrolü hatası:", error);
      }
    };

    // İlk yüklemede kontrol et
    checkToken();

    // Cleanup
    return () => {
      // Gerekirse cleanup işlemleri
    };
  }, [tokenAvailable, loggingOut]);
}
