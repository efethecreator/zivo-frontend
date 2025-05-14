"use client";

import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";

export default function LogoutScreen() {
  const { logout, loggingOut } = useAuth();

  useEffect(() => {
    console.log("🔄 Login ekranı hazırlanıyor, auth durumu sıfırlanıyor...");

    // Çıkış işlemini başlat
    const performLogout = async () => {
      try {
        // Önce global API isteklerini durdur
        await logout();
      } catch (error) {
        console.error("❌ Çıkış işlemi başarısız:", error);
        // Hata olsa bile login sayfasına yönlendir
        router.replace("/auth/login");
      }
    };

    performLogout();
  }, [logout]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{ marginTop: 20 }}>Çıkış yapılıyor...</Text>
    </View>
  );
}
