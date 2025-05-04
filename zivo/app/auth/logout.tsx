"use client";

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SecureStoreService } from "../../services/secureStore.service";
import { router } from "expo-router";

export const logout = async () => {
  await SecureStoreService.removeItem("zivo_token");
  await SecureStoreService.removeItem("zivo_user");

  console.log("✅ User logged out.");

  router.replace("/auth/login");
};

// Add default export component for Expo Router
export default function LogoutScreen() {
  React.useEffect(() => {
    // Call logout function when component mounts
    logout();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{ marginTop: 20 }}>Logging out...</Text>
    </View>
  );
}
