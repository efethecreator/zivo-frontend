"use client";

import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";
import { AuthProvider } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import { useCustomFonts } from "../hooks/useFonts"; // Fontları yüklemek için özel bir hook
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Remove the global StatusBarManager import since we'll use it per-screen

// React Query Client ayarı
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useCustomFonts(); // ✅ Font yükleniyor mu?

  // Uygulama yeniden başlatıldığında veya yüklendiğinde query cache'i temizle
  useEffect(() => {
    // Tüm query cache'i temizle
    queryClient.clear();
    console.log("🧹 Query cache temizlendi");
  }, []);

  if (!fontsLoaded) {
    // Fontlar yüklenene kadar loading göster
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2596be" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* Remove global StatusBar configuration */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Slot />
          <Toast />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
