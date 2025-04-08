// app/business/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { View, Text } from "react-native";

export default function BusinessLayout() {
  const { user } = useAuth();

  // Kullanıcı business değilse veya giriş yapmamışsa
  if (!user || user.role !== "business") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Bu sayfayı görüntülemek için işletme hesabı gereklidir.</Text>
      </View>
    );
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Randevular",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Hizmetler",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: "Personel",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ❌ GÖRÜNMEYECEK SAYFALAR */}
      <Tabs.Screen
        name="account-settings"
        options={{
          tabBarButton: () => null, // Tab'da gösterilmez
        }}
      />
      <Tabs.Screen
        name="payment-settings"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="help-center"
        options={{
          
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="contact-support"
        options={{
          
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="business-details"
        options={{
          
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="business-address"
        options={{
          
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="notifications-settings"
        options={{
          
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="working-hours"
        options={{
          
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
  name="appointments/new"
  options={{
    href: null, // TabBar'da görünmez
  }}
/>

<Tabs.Screen
  name="[id]"
  options={{
    href: null, // TabBar'da görünmez
  }}
/>

    </Tabs>
  );
}