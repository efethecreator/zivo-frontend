import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const WEB_API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const MOBILE_API_URL =
  process.env.EXPO_PUBLIC_MOBILE_API_URL || "http://localhost:4000/api/v1";

export const getApiUrl = () => {
  return Platform.OS === "web" ? WEB_API_URL : MOBILE_API_URL;
};

function isValidKey(key: string): boolean {
  return /^[\w.-]+$/.test(key); // sadece harf, rakam, _ . -
}

export const SecureStoreService = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (!key || !isValidKey(key)) {
        console.warn("[SecureStore] ❌ Invalid key passed to getItem:", key);
        return null;
      }
      const value =
        Platform.OS === "web"
          ? localStorage.getItem(key)
          : await SecureStore.getItemAsync(key);

      console.log(`[SecureStore] 🔍 getItem ${key}:`, value);
      return value;
    } catch (error) {
      console.error("[SecureStore] ❌ Error getting item:", error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!key || !isValidKey(key)) {
        console.warn("[SecureStore] ❌ Invalid key passed to setItem:", key);
        return;
      }
      console.log(`[SecureStore] 💾 setItem ${key}:`, value);

      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error("[SecureStore] ❌ Error setting item:", error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (!key || !isValidKey(key)) {
        console.warn("[SecureStore] ❌ Invalid key passed to removeItem:", key);
        return;
      }

      console.log(`[SecureStore] 🗑️ removeItem ${key}`);
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error("[SecureStore] ❌ Error removing item:", error);
    }
  },
};
