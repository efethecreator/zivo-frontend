"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useMutation } from "@tanstack/react-query"
import { authApi } from "../../utils/api"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  // Register mutation with TanStack Query
  const registerMutation = useMutation({
    mutationFn: (userData: {
      fullName: string
      email: string
      password: string
      userType: string
    }) => authApi.register(userData),
    onSuccess: async (data) => {
      // Backend'in döndürdüğü başarı mesajını kullanıyoruz
      const successMessage = data.message || "Kayıt başarılı"

      Alert.alert("Kayıt Başarılı", successMessage, [
        {
          text: "Giriş Yap",
          onPress: () => router.replace("../auth/login"),
        },
      ])
    },
    onError: (error: any) => {
      console.error("Register error:", error)

      // Backend'in hata formatına göre mesajı alıyoruz
      const errorMessage = error.response?.data?.message || "Kayıt başarısız. Lütfen tekrar deneyin."

      Alert.alert("Kayıt Başarısız", errorMessage)
    },
  })

  const handleRegister = () => {
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor")
      return
    }

    if (password.length < 3) {
      Alert.alert("Hata", "Şifre en az 3 karakter olmalıdır")
      return
    }

    // Backend'in beklediği formatta veri gönderiyoruz
    registerMutation.mutate({
      fullName: name,
      email,
      password,
      userType: "customer", // Kullanıcı tipini customer olarak ayarlıyoruz
    })
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="flex-grow">
        <View className="flex-1 justify-center px-6 pt-10 pb-16">
          {/* Logo and Header */}
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-purple-600 mb-2">BookMe</Text>
            <Text className="text-gray-500 text-center">Book your beauty appointments with ease</Text>
          </View>

          {/* Register Form */}
          <View className="space-y-4">
            <Text className="text-2xl font-bold text-gray-800 mb-6">Create an account</Text>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`rounded-lg py-3 px-4 mt-6 items-center ${registerMutation.isPending ? "bg-purple-400" : "bg-purple-600"}`}
              onPress={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("../auth/login")}>
              <Text className="text-purple-600 font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

