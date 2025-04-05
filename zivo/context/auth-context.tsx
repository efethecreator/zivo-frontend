"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter, usePathname } from "expo-router"

type User = {
  id: string
  email: string
  fullName: string
  profileId: string
  role: string
} | null

type AuthContextType = {
  user: User
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData: any) => Promise<void>
  logout: () => Promise<void>
  requireAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Kullanıcı verilerini yükleme
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("user_data")
        if (userDataString) {
          setUser(JSON.parse(userDataString))
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const login = async (token: string, userData: any) => {
    try {
      await AsyncStorage.setItem("auth_token", token)
      await AsyncStorage.setItem("user_data", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Error saving auth data:", error)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth_token")
      await AsyncStorage.removeItem("user_data")
      setUser(null)
    } catch (error) {
      console.error("Error removing auth data:", error)
    }
  }

  // Kimlik doğrulama gerektiren işlemler için
  const requireAuth = () => {
    if (!user && !isLoading) {
      router.push("/auth/login")
      return false
    }
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

