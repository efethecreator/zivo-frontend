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
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen email ve şifre alanlarını doldurun")
      return
    }

    setIsLoading(true)

    try {
      // Simüle edilmiş login işlemi
      // Gerçek uygulamada burada API çağrısı yaparsınız
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Başarılı giriş sonrası kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem("auth_token", "sample_token")
      await AsyncStorage.setItem(
        "user_data",
        JSON.stringify({
          id: "1",
          email: email,
          fullName: "Test User",
        }),
      )

      router.replace("/tabs")
    } catch (error) {
      console.error("Login error:", error)
      Alert.alert("Hata", "Giriş yapılırken bir sorun oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToRegister = () => {
    router.push("/auth/register")
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="flex-grow">
        <View className="flex-1 justify-center px-6 pt-10 pb-16">
          {/* Logo and Header */}
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-[#2596be] mb-2">BookMe</Text>
            <Text className="text-gray-500 text-center">Book your beauty appointments with ease</Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <Text className="text-2xl font-bold text-gray-800 mb-6">Login to your account</Text>

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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity>
              <Text className="text-[#2596be] text-right font-medium">Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`rounded-lg py-3 px-4 mt-6 items-center ${isLoading ? "bg-blue-400" : "bg-[#2596be]"}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text className="text-[#2596be] font-bold">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

