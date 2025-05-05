import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar"; // StatusBar ekleniyor
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <>
      {/* Global StatusBar ayarı: beyaz arka plan üzerinde koyu ikonlar */}
      <StatusBar style="dark" backgroundColor="#fff" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#1B9AAA",
          tabBarInactiveTintColor: "#666",
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "My ZIVO",
            tabBarLabel: ({ color }) => (
              <Text style={{ fontFamily: "Outfit-Bold", fontSize: 12, color }}>
                My ZIVO
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarLabel: ({ color }) => (
              <Text style={{ fontFamily: "Outfit-Bold", fontSize: 12, color }}>
                Explore
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarLabel: ({ color }) => (
              <Text style={{ fontFamily: "Outfit-Bold", fontSize: 12, color }}>
                Map
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="appointments"
          options={{
            title: "Appointments",
            tabBarLabel: ({ color }) => (
              <Text style={{ fontFamily: "Outfit-Bold", fontSize: 12, color }}>
                Appointments
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: ({ color }) => (
              <Text style={{ fontFamily: "Outfit-Bold", fontSize: 12, color }}>
                Profile
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
