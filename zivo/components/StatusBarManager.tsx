"use client";

import type React from "react";
import { useEffect } from "react";
import { StatusBar, Platform, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

interface StatusBarManagerProps {
  backgroundColor?: string;
  barStyle?: "light-content" | "dark-content";
  translucent?: boolean;
}

/**
 * A consistent StatusBar component that works across iOS and Android
 * and updates dynamically based on the current screen
 */
export const StatusBarManager: React.FC<StatusBarManagerProps> = ({
  backgroundColor = "#FFFFFF",
  barStyle = "dark-content",
  translucent = false,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  // Update StatusBar whenever the route changes
  useEffect(() => {
    StatusBar.setBackgroundColor(backgroundColor);
    StatusBar.setBarStyle(barStyle);
    StatusBar.setTranslucent(translucent);
  }, [backgroundColor, barStyle, translucent, route.name]);

  // Also listen for navigation events to ensure StatusBar updates
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      StatusBar.setBackgroundColor(backgroundColor);
      StatusBar.setBarStyle(barStyle);
      StatusBar.setTranslucent(translucent);
    });

    return unsubscribe;
  }, [navigation, backgroundColor, barStyle, translucent]);

  return (
    <>
      {!translucent && Platform.OS === "android" && (
        <View
          style={[
            styles.statusBarPlaceholder,
            {
              height: insets.top,
              backgroundColor,
            },
          ]}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  statusBarPlaceholder: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});
