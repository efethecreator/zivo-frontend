"use client"

import { useState, useEffect } from "react"
import { Slot } from "expo-router"
import { AuthProvider } from "../context/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { View, StyleSheet } from "react-native"
import { AnimatedSplash } from "../components/AnimatedSplash"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"  // StatusBar import edildi

const queryClient = new QueryClient()

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Gerekli kaynak yüklemeleri burada yapılabilir
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <View style={styles.container}>
            {/* Global StatusBar ayarı */}
            <StatusBar style="dark" backgroundColor="#fff" />
            {!isReady && <AnimatedSplash onFinish={() => setIsReady(true)} />}
            <Slot />
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
