"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"

export default function AppointmentsTab() {
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-xl font-bold mb-4">Appointments</Text>
      <Text className="text-gray-600 mb-6">Your appointments will appear here</Text>

      <TouchableOpacity className="bg-[#2596be] py-3 px-6 rounded-lg" onPress={() => router.push("/auth/login")}>
        <Text className="text-white font-medium">Login to view appointments</Text>
      </TouchableOpacity>
    </View>
  )
}

