import { useFonts } from "expo-font";

export const useCustomFonts = () => {
  return useFonts({
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-Bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "Outfit-Thin": require("../assets/fonts/Outfit-Thin.ttf"),
    "Outfit-Light": require("../assets/fonts/Outfit-Light.ttf"),
  });
};
