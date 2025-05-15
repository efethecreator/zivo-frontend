"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, useCallback } from "react"
import { SecureStoreService } from "../services/secureStore.service"
import type { User } from "../services/user.service"
import { login as apiLogin, register as apiRegister } from "../services/auth.service"
import { router } from "expo-router"
import { Alert, AppState, type AppStateStatus } from "react-native"
import { useQueryClient } from "@tanstack/react-query"

// AuthContextType'a loggingOut ekleyelim
type AuthContextType = {
  user: User | null
  login: (userData: { email: string; password: string }) => Promise<void>
  register: (userData: {
    fullName: string
    email: string
    password: string
    phone: string
    userType: "customer" | "business" | "store_owner" | "admin"
  }) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  updateUser: (userData: Partial<User>) => void
  resetAuth: () => Promise<void>
  refreshUserState: () => Promise<void>
  tokenAvailable: boolean | null
  loggingOut: boolean // Yeni flag
}

// Use null! to tell TypeScript we'll handle the null case
const AuthContext = createContext<AuthContextType>(null!)

// AuthProvider içinde loggingOut state'i ekleyelim
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()
  const [tokenAvailable, setTokenAvailable] = useState<boolean | null>(null)
  const [loggingOut, setLoggingOut] = useState(false) // Yeni state

  // Kullanıcı durumunu SecureStore'dan yenile
  const refreshUserState = useCallback(async () => {
    try {
      console.log("🔄 Kullanıcı durumu yenileniyor...")
      const userJson = await SecureStoreService.getItem("zivo_user")
      const token = await SecureStoreService.getItem("zivo_token")

      if (userJson && token) {
        const parsedUser = JSON.parse(userJson)
        console.log("👤 Kullanıcı durumu yenilendi:", parsedUser.email)
        setUser(parsedUser)
        setTokenAvailable(true)
      } else {
        console.log("⚠️ Kullanıcı bilgisi bulunamadı, state temizleniyor")
        setUser(null)
        setTokenAvailable(false)
      }
    } catch (error) {
      console.error("❌ Kullanıcı durumu yenilenirken hata:", error)
      setUser(null)
      setTokenAvailable(false)
    }
  }, [])

  // AppState değişikliklerini izle
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("🔄 Uygulama aktif oldu, kullanıcı durumu yenileniyor...")
        refreshUserState()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [refreshUserState])

  // Auth durumunu tamamen sıfırla
  const resetAuth = async () => {
    console.log("🔄 Auth durumu sıfırlanıyor...")

    // Önce state'i temizle
    setUser(null)
    setTokenAvailable(false)

    // Sonra storage'ı temizle
    await SecureStoreService.removeItem("zivo_token")
    await SecureStoreService.removeItem("zivo_user")

    // Query cache'i temizle
    queryClient.clear()

    // Kontrol için tekrar oku
    const token = await SecureStoreService.getItem("zivo_token")
    const userJson = await SecureStoreService.getItem("zivo_user")
    console.log("🧪 Reset sonrası token:", token)
    console.log("🧪 Reset sonrası user:", userJson)
  }

  useEffect(() => {
    // Check if user is already logged in
    const loadUser = async () => {
      try {
        await refreshUserState()
      } catch (error) {
        console.error("❌ Failed to load user from storage", error)
        await resetAuth() // Hata durumunda sıfırla
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [refreshUserState])

  const handleLogin = async (userData: { email: string; password: string }) => {
    try {
      console.log("🔑 Login attempt for:", userData.email)

      // Önce mevcut durumu tamamen temizle
      await resetAuth()

      // Login işlemini gerçekleştir
      const response = await apiLogin(userData.email, userData.password)
      const { token, user } = response

      console.log("✅ Login successful for:", user.email)

      // Önce token'ı kaydet
      await SecureStoreService.setItem("zivo_token", token)

      // Sonra kullanıcı bilgilerini kaydet
      await SecureStoreService.setItem("zivo_user", JSON.stringify(user))

      // En son state'i güncelle
      console.log("👤 Setting user state after login:", user.email)
      setUser(user)
      setTokenAvailable(true)

      // Query cache'i temizle
      queryClient.clear()

      // Kontrol için
      const storedToken = await SecureStoreService.getItem("zivo_token")
      const storedUser = await SecureStoreService.getItem("zivo_user")
      console.log("🧪 Login sonrası token:", storedToken ? "exists" : "null")
      console.log("🧪 Login sonrası user:", storedUser ? JSON.parse(storedUser).email : "null")

      // Kısa bir gecikme ekle
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error("❌ Login failed", error)
      Alert.alert("Hata", "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
      throw error
    }
  }

  const handleRegister = async (userData: {
    fullName: string
    email: string
    password: string
    phone: string
    userType: "customer" | "business" | "store_owner" | "admin"
  }) => {
    try {
      // Önce register ol
      await apiRegister(userData)

      console.log("✅ Registration successful, now logging in...")

      // Başarılı kayıt sonrası otomatik login yap
      await handleLogin({ email: userData.email, password: userData.password })

      // Update the user's profile with the phone number
      try {
        const { updateMyProfile } = await import("../services/user.service")
        await updateMyProfile({ phone: userData.phone })
        console.log("✅ Phone number updated in profile")
      } catch (profileError) {
        console.error("❌ Failed to update phone in profile:", profileError)
        // Continue with registration even if profile update fails
      }

      // Kullanıcıyı ana ekrana yönlendir
      router.replace("/(tabs)")
    } catch (error) {
      console.error("❌ Registration failed", error)
      throw error
    }
  }

  // handleLogout fonksiyonunu güncelleyelim
  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...")

      // Logout flag'ini aktif et
      setLoggingOut(true)

      // Önce state'i temizle
      setUser(null)
      setTokenAvailable(false)

      // Query cache'i temizle
      queryClient.clear()

      // Sonra storage'ı temizle
      await SecureStoreService.removeItem("zivo_token")
      await SecureStoreService.removeItem("zivo_user")

      // Kontrol için
      const token = await SecureStoreService.getItem("zivo_token")
      const userJson = await SecureStoreService.getItem("zivo_user")
      console.log("🧪 Logout sonrası token:", token)
      console.log("🧪 Logout sonrası user:", userJson)

      console.log("✅ User logged out.")

      // Kısa bir gecikme ekle
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Yönlendirme
      router.replace("/auth/login")
    } catch (error) {
      console.error("❌ Logout failed", error)
      // Hata olsa bile login sayfasına yönlendir
      router.replace("/auth/login")
    } finally {
      // İşlem bittiğinde flag'i kapat
      setLoggingOut(false)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return

      // Update user data
      const updatedUser: User = {
        ...user,
        ...userData,
      }

      setUser(updatedUser)
      await SecureStoreService.setItem("zivo_user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Failed to update user", error)
      throw error
    }
  }

  // AuthContext.Provider value'suna loggingOut ekleyelim
  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isLoading,
        updateUser,
        resetAuth,
        refreshUserState,
        tokenAvailable,
        loggingOut, // Yeni flag'i ekleyelim
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
