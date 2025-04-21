"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { User } from "../services/user.service"
import { login, register, logout } from "../services/auth.service"
import { router } from "expo-router"

type AuthContextType = {
  user: User | null
  login: (userData: { email: string; password: string }) => Promise<void>
  register: (userData: {
    fullName: string;
    email: string;
    password: string;
    userType: 'customer' | 'business' | 'store_owner' | 'admin';
  }) => Promise<void>
  logout: () => Promise<void>
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
        const token = await AsyncStorage.getItem("@zivo_token")
        if (userJson && token) {
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

  const handleLogin = async (userData: { email: string; password: string }) => {
    try {
      const response = await login(userData.email, userData.password)
      const { token, user } = response

      // Store token first
      await AsyncStorage.setItem("@zivo_token", token)
      // Then store user and update state
      await AsyncStorage.setItem("@zivo_user", JSON.stringify(user))
      setUser(user)
    } catch (error) {
      console.error("Login failed", error)
      throw error
    }
  }

  const handleRegister = async (userData: {
    fullName: string;
    email: string;
    password: string;
    userType: 'customer' | 'business' | 'store_owner' | 'admin';
  }) => {
    try {
      await register(userData)
      // Başarılı kayıt sonrası login sayfasına yönlendir
      router.replace("/auth/login")
    } catch (error) {
      console.error("Registration failed", error)
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      await AsyncStorage.removeItem("@zivo_user")
      await AsyncStorage.removeItem("@zivo_token")
      setUser(null)
      router.replace("/auth/login")
    } catch (error) {
      console.error("Logout failed", error)
      throw error
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
      await AsyncStorage.setItem("@zivo_user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Failed to update user", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isLoading,
        updateUser,
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
