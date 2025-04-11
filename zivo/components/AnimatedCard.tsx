"use client"

import type React from "react"
import { useEffect } from "react"
import { StyleSheet, type ViewStyle } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated"

interface AnimatedCardProps {
  children: React.ReactNode
  style?: ViewStyle
  index?: number
  delay?: number
}

export const AnimatedCard = ({ children, style, index = 0, delay = 0 }: AnimatedCardProps) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  useEffect(() => {
    const calculatedDelay = delay + index * 100

    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })

      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    }, calculatedDelay)
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }
  })

  return <Animated.View style={[styles.card, animatedStyle, style]}>{children}</Animated.View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
})
