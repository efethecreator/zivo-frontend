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

export class SecureStoreService {
  static async getItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      console.log(
        `[SecureStore] 🔍 getItem ${key}: ${value ? "exists" : "null"}`
      );
      return value;
    } catch (error) {
      console.error(`[SecureStore] ❌ Error getting ${key}:`, error);
      return null;
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(
        `[SecureStore] 💾 setItem ${key}: ${value.substring(0, 20)}${
          value.length > 20 ? "..." : ""
        }`
      );
    } catch (error) {
      console.error(`[SecureStore] ❌ Error setting ${key}:`, error);
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`[SecureStore] 🗑️ removeItem ${key}`);

      // Silme işleminin başarılı olup olmadığını kontrol et
      const checkValue = await SecureStore.getItemAsync(key);
      console.log(`[SecureStore] 🧪 post-delete check ${key}: ${checkValue}`);
    } catch (error) {
      console.error(`[SecureStore] ❌ Error removing ${key}:`, error);
    }
  }
}
