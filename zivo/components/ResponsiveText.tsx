import type React from "react";
import { Text, type TextStyle, type TextProps } from "react-native";
import { fontSizes } from "../utils/responsive";

interface ResponsiveTextProps extends TextProps {
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl" | "title" | "header";
  weight?: "thin" | "light" | "regular" | "bold";
  style?: TextStyle;
  children: React.ReactNode;
}

/**
 * ResponsiveText component for consistent text sizing across devices
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  size = "m",
  weight = "regular",
  style,
  children,
  ...props
}) => {
  // Map weight to font family
  const getFontFamily = () => {
    switch (weight) {
      case "thin":
        return "Outfit-Thin";
      case "light":
        return "Outfit-Light";
      case "bold":
        return "Outfit-Bold";
      case "regular":
      default:
        return "Outfit-Regular";
    }
  };

  // Get font size from our responsive sizes
  const getFontSize = () => {
    return fontSizes[size];
  };

  return (
    <Text
      style={[
        {
          fontSize: getFontSize(),
          fontFamily: getFontFamily(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
