import type React from "react";
import { View, StyleSheet, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: any;
  edges?: Array<"top" | "right" | "bottom" | "left">;
  backgroundColor?: string;
}

/**
 * SafeAreaWrapper bileşeni, içeriği güvenli alan içinde render eder
 * ve platform farklılıklarını dikkate alır.
 */
export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  edges = ["top", "right", "bottom", "left"],
  backgroundColor = "#fff",
}) => {
  const insets = useSafeAreaInsets();

  // Kenarlar için padding değerlerini hesapla
  const padding = {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
  };

  return (
    <View style={[styles.container, padding, { backgroundColor }, style]}>
      {Platform.OS === "android" && (
        <StatusBar
          backgroundColor={backgroundColor}
          barStyle={
            backgroundColor === "#fff" ? "dark-content" : "light-content"
          }
          translucent
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
