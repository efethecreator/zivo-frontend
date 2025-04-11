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
import { useFonts } from "expo-font"

const { width, height } = Dimensions.get("window")

interface AnimatedSplashProps {
  onFinish: () => void
}

export const AnimatedSplash = ({ onFinish }: AnimatedSplashProps) => {
  const [fontsLoaded] = useFonts({
    SpecialGothic: require("../assets/fonts/SpecialGothicCondensedOne-Regular.ttf"), // yol doğruysa
  })

  const logoOpacity = useSharedValue(0)
  const logoScale = useSharedValue(0.8)
  const backgroundOpacity = useSharedValue(1)
  const backgroundScale = useSharedValue(1)

  useEffect(() => {
    if (!fontsLoaded) return

    logoOpacity.value = withDelay(300, withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))
    logoScale.value = withDelay(300, withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))

    const timeout = setTimeout(() => {
      backgroundOpacity.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) })
      backgroundScale.value = withTiming(1.2, { duration: 800, easing: Easing.out(Easing.ease) }, () => {
        runOnJS(onFinish)()
      })
    }, 2000)

    return () => clearTimeout(timeout)
  }, [fontsLoaded])

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

  if (!fontsLoaded) return null // Font yüklenmeden hiçbir şey gösterme

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
    backgroundColor: "#FFFFFF", // beyaz zemin
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 48,
    fontFamily: "SpecialGothic",
    color: "#000",
    letterSpacing: 2,
  },
})
