"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"

export default function ProfileTab() {
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-6">Get started</Text>
      <Text className="text-gray-600 text-center mb-8">
        Create an account or log in to book and manage your appointments.
      </Text>

      <View className="w-full mb-6">
        <TouchableOpacity className="bg-[#2596be] py-4 rounded-lg mb-8" onPress={() => router.push("/auth/login")}>
          <Text className="text-white font-bold text-center">Continue</Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-4 text-gray-500">OR</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <TouchableOpacity className="flex-row items-center justify-center border border-gray-300 py-3 rounded-lg mb-4">
          <Text className="font-medium ml-2">Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-center border border-gray-300 py-3 rounded-lg mb-4">
          <Text className="font-medium ml-2">Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-center border border-gray-300 py-3 rounded-lg">
          <Text className="font-medium ml-2">Continue with Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

