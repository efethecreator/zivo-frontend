"use client"

import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { View, Text } from "react-native"
import { usePathname } from "expo-router"

export default function BusinessLayout() {
  const { user } = useAuth()
  const pathname = usePathname()

  // İşletme detay sayfası için özel durum
  // URL'de sayısal bir ID varsa (örn: /123), bu müşteri tarafından görüntülenen işletme detay sayfasıdır
  const isBusinessDetailPage = /^\/\d+$/.test(pathname)

  // Eğer işletme detay sayfasıysa, layout kontrolünü atla
  if (isBusinessDetailPage) {
    return <Tabs.Screen options={{ headerShown: false }} />
  }

  // Kullanıcı business değilse veya giriş yapmamışsa
  if (!user || user.role !== "business") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Bu sayfayı görüntülemek için işletme hesabı gereklidir.</Text>
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1B9AAA",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Randevular",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Hizmetler",
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: "Personel",
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

      {/* Alt sayfaları gizleyelim */}
      <Tabs.Screen
        name="account-settings"
        options={{
          href: null, // TabBar'da görünmez ve route'a doğrudan erişilemez
        }}
      />
      <Tabs.Screen
        name="payment-settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="help-center"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="contact-support"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="business-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="business-address"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications-settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="working-hours"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="appointments/new"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
