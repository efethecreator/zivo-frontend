import { View, Text, TouchableOpacity } from "react-native"
import { Link } from "expo-router"

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Oops!</Text>
      <Text className="text-lg text-center mb-6">This screen doesn't exist.</Text>
      <Link href="/" asChild>
        <TouchableOpacity className="bg-[#2596be] py-3 px-6 rounded-lg">
          <Text className="text-white font-medium">Go to home screen!</Text>
        </TouchableOpacity>
      </Link>
    </View>
  )
}

