import type React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalize, fontSizes, spacing } from "../utils/responsive";
import { StatusBarManager } from "./StatusBarManager";

interface ResponsiveHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  iconColor?: string;
}

/**
 * ResponsiveHeader bileşeni, tüm platformlarda tutarlı görünen bir header sağlar.
 */
export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title,
  onBack,
  rightComponent,
  backgroundColor = "#fff",
  titleColor = "#000",
  iconColor = "#000",
}) => {
  const insets = useSafeAreaInsets();

  // Header yüksekliği hesaplama - slightly reduced
  const headerHeight = normalize(52);

  // Platform bazlı padding ayarları
  const paddingTop =
    Platform.OS === "ios"
      ? insets.top
      : insets.top > 0
      ? insets.top
      : normalize(8);

  // Determine StatusBar style based on background color
  const barStyle =
    titleColor === "#fff" || titleColor === "#FFFFFF"
      ? "light-content"
      : "dark-content";

  return (
    <>
      {/* Add StatusBarManager to each header */}
      <StatusBarManager backgroundColor={backgroundColor} barStyle={barStyle} />

      <View
        style={[
          styles.container,
          {
            backgroundColor,
            paddingTop,
            height: headerHeight + paddingTop,
          },
        ]}
      >
        <View style={styles.content}>
          {onBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="arrow-back"
                size={normalize(22)}
                color={iconColor}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}

          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>

          {rightComponent ? (
            rightComponent
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.m,
  },
  backButton: {
    width: normalize(36),
    height: normalize(36),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: normalize(18),
  },
  title: {
    flex: 1,
    fontSize: fontSizes.l, // Reduced from xl to l
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Outfit-Bold",
  },
  placeholder: {
    width: normalize(36), // Reduced from 40
  },
});
