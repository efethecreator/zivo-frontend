"use client"

import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { useAuth } from "../../context/AuthContext"
import { setLogoutState } from "../../services/api"
import { router } from "expo-router"

export default function LogoutScreen() {
  const { logout } = useAuth()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Hızlıca API isteklerini engelle (race condition'dan kaçınmak için)
        setLogoutState(true)

        // Tüm API isteklerinin durması için biraz bekle
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Logout işlemini gerçekleştir
        await logout()

        // Yönlendirme işlemini burada da yapalım (çift kontrol)
        router.replace("/auth/login")
      } catch (error) {
        console.error("Logout failed:", error)
        // Hata olsa bile login sayfasına yönlendir
        router.replace("/auth/login")
      }
    }

    handleLogout()
  }, [logout])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>Çıkış yapılıyor...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 20,
    fontSize: 18,
  },
})
