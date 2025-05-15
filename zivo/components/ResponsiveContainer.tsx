import type React from "react";
import { View, type ViewStyle, StyleSheet } from "react-native";
import { spacing } from "../utils/responsive";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: "none" | "xs" | "s" | "m" | "l" | "xl";
}

/**
 * ResponsiveContainer component for consistent layout spacing across devices
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  padding = "m",
}) => {
  const getPadding = () => {
    if (padding === "none") return 0;
    return spacing[padding];
  };

  return (
    <View
      style={[
        styles.container,
        {
          padding: getPadding(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
});
