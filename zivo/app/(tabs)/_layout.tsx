import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar"; // StatusBar ekleniyor
import { Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalize, fontSizes } from "../../utils/responsive";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

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
            height:
              normalize(55) +
              (insets.bottom > 0 ? insets.bottom : normalize(5)), // Adjusted height
            paddingTop: normalize(6),
            paddingBottom: insets.bottom > 0 ? insets.bottom : normalize(6),
            backgroundColor: "#fff",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarLabelStyle: {
            fontFamily: "Outfit-Bold",
            fontSize: fontSizes.xs,
            marginTop: Platform.OS === "android" ? -3 : 0, // Adjusted for Android
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === "android" ? 3 : 0, // Adjusted for Android
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "My ZIVO",
            tabBarLabel: ({ color }) => (
              <Text
                style={{
                  fontFamily: "Outfit-Bold",
                  fontSize: fontSizes.xs,
                  color,
                }}
              >
                My ZIVO
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="heart-outline"
                size={normalize(size * 0.9)}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarLabel: ({ color }) => (
              <Text
                style={{
                  fontFamily: "Outfit-Bold",
                  fontSize: fontSizes.xs,
                  color,
                }}
              >
                Explore
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="search"
                size={normalize(size * 0.9)}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarLabel: ({ color }) => (
              <Text
                style={{
                  fontFamily: "Outfit-Bold",
                  fontSize: fontSizes.xs,
                  color,
                }}
              >
                Map
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={normalize(size * 0.9)} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="appointments"
          options={{
            title: "Appointments",
            tabBarLabel: ({ color }) => (
              <Text
                style={{
                  fontFamily: "Outfit-Bold",
                  fontSize: fontSizes.xs,
                  color,
                }}
              >
                Appointments
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="calendar"
                size={normalize(size * 0.9)}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: ({ color }) => (
              <Text
                style={{
                  fontFamily: "Outfit-Bold",
                  fontSize: fontSizes.xs,
                  color,
                }}
              >
                Profile
              </Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person"
                size={normalize(size * 0.9)}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
