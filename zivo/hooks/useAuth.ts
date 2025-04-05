"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../utils/api"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    // Add other user properties as needed
  }
}

export function useAuth() {
  const queryClient = useQueryClient()
  const navigation = useNavigation()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials.email, credentials.password),
    onSuccess: async (data: AuthResponse) => {
      // Save auth token to AsyncStorage (React Native's equivalent to localStorage)
      await AsyncStorage.setItem("auth_token", data.token)

      // Save user data in the query cache
      queryClient.setQueryData(["user"], data.user)

      // Navigate to home screen
      navigation.navigate("Home" as never)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      // Clear auth token
      await AsyncStorage.removeItem("auth_token")

      // Clear user data from cache
      queryClient.removeQueries({ queryKey: ["user"] })

      // Navigate to login screen
      navigation.navigate("Login" as never)
    },
  })

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  }
}

