import { SecureStoreService } from "../../services/secureStore.service";
import { router } from "expo-router";

export const logout = async () => {
  await SecureStoreService.removeItem("zivo_token");
  await SecureStoreService.removeItem("zivo_user");

  console.log("✅ User logged out.");

  router.replace("/auth/login"); // veya push, navigate ihtiyacına göre
};
