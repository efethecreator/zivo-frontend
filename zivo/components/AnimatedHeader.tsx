"use client";

import type React from "react";
import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimatedHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  scrollY?: Animated.SharedValue<number>;
  style?: ViewStyle;
}

export const AnimatedHeader = ({
  title,
  onBack,
  rightComponent,
  scrollY,
  style,
}: AnimatedHeaderProps) => {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};

    const backgroundColor = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolate.CLAMP
    );

    const elevation = interpolate(
      scrollY.value,
      [0, 100],
      [0, 3],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor: `rgba(255, 255, 255, ${backgroundColor})`,
      shadowOpacity: backgroundColor * 0.1,
      elevation: elevation,
    };
  });

  return (
    <Animated.View
      style={[
        styles.header,
        { paddingTop: insets.top + 10 },
        animatedBackgroundStyle,
        style,
      ]}
    >
      <Animated.View style={[styles.headerContent, animatedStyle]}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {rightComponent ? (
          <View style={styles.rightComponent}>{rightComponent}</View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  rightComponent: {
    width: 40,
  },
  placeholder: {
    width: 40,
  },
});
