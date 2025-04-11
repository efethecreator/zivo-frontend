"use client"

import { useEffect } from "react"
import { Text, StyleSheet, Dimensions } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated"

const { width, height } = Dimensions.get("window")

interface AnimatedSplashProps {
  onFinish: () => void
}

export const AnimatedSplash = ({ onFinish }: AnimatedSplashProps) => {
  const logoOpacity = useSharedValue(0)
  const logoScale = useSharedValue(0.8)
  const backgroundOpacity = useSharedValue(1)
  const backgroundScale = useSharedValue(1)

  useEffect(() => {
    // Animate logo in
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))
    logoScale.value = withDelay(300, withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))

    // Animate out after delay
    const timeout = setTimeout(() => {
      backgroundOpacity.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) })
      backgroundScale.value = withTiming(1.2, { duration: 800, easing: Easing.out(Easing.ease) }, () => {
        runOnJS(onFinish)()
      })
    }, 2000)

    return () => clearTimeout(timeout)
  }, [])

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    }
  })

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
      transform: [{ scale: backgroundScale.value }],
    }
  })

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Text style={styles.logoText}>ZIVO</Text>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "#1B9AAA",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: "#fff",
    marginTop: 10,
    letterSpacing: 1,
  },
})
