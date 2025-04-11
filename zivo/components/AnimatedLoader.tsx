"use client";

import { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

interface AnimatedLoaderProps {
  size?: number;
  color?: string;
}

export const AnimatedLoader = ({
  size = 40,
  color = "#1B9AAA",
}: AnimatedLoaderProps) => {
  const dots = useRef([
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ]).current;

  useEffect(() => {
    dots.forEach((dot, index) => {
      dot.value = withRepeat(
        withDelay(
          index * 150,
          withTiming(1, {
            duration: 600,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        ),
        -1,
        true
      );
    });

    return () => {
      dots.forEach((dot) => cancelAnimation(dot));
    };
  }, [dots]);

  const animatedStyles = useMemo(() => {
    return dots.map((dot) =>
      useAnimatedStyle(() => {
        return {
          opacity: dot.value,
          transform: [
            { scale: dot.value * 0.6 + 0.4 },
            { translateY: (1 - dot.value) * 10 },
          ],
        };
      })
    );
  }, [dots]);

  return (
    <View style={styles.container}>
      {dots.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size / 3,
              height: size / 3,
              backgroundColor: color,
              margin: size / 12,
            },
            animatedStyles[index],
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    borderRadius: 100,
  },
});
