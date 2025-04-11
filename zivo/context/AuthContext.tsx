"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { User } from "../types"

type AuthContextType = {
  user: User | null
  login: (userData: Partial<User>) => void
  register: (userData: Partial<User>) => void
  logout: () => void
  isLoading: boolean
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("@zivo_user")
        if (userJson) {
          setUser(JSON.parse(userJson))
        }
      } catch (error) {
        console.error("Failed to load user from storage", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (userData: Partial<User>) => {
    try {
      // In a real app, this would make an API call
      // For demo, we'll just set the user directly
      const mockUser: User = {
        id: 1,
        name: "Murat Efe Çetin",
        email: userData.email || "user@example.com",
        phone: "06 25406344",
        role: "customer",
      }

      setUser(mockUser)
      await AsyncStorage.setItem("@zivo_user", JSON.stringify(mockUser))
      await AsyncStorage.setItem("@zivo_token", "mock-jwt-token")
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  const register = async (userData: Partial<User>) => {
    try {
      // In a real app, this would make an API call
      // For demo, we'll just set the user directly
      const mockUser: User = {
        id: 1,
        name: userData.name || "New User",
        email: userData.email || "user@example.com",
        phone: userData.phone || "",
        password: userData.password,
        role: userData.role || "customer", // Kullanıcıdan gelen rolü kullan
        business: userData.business, // Business bilgilerini de ekleyelim
      }

      console.log("Registering user with role:", mockUser.role) // Debug için

      setUser(mockUser)
      await AsyncStorage.setItem("@zivo_user", JSON.stringify(mockUser))
      await AsyncStorage.setItem("@zivo_token", "mock-jwt-token")
    } catch (error) {
      console.error("Registration failed", error)
    }
  }
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("@zivo_user")
      await AsyncStorage.removeItem("@zivo_token")
      setUser(null)
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  // updateUser fonksiyonunu ekleyin
  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return

      // Mevcut kullanıcı bilgilerini güncelle
      const updatedUser: User = {
        ...user,
        ...userData,
      }

      setUser(updatedUser)
      await AsyncStorage.setItem("@zivo_user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Update user failed", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUser }}>
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
