// app/business/profile.tsx
"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"

export default function BusinessProfileScreen() {
  const { user, logout } = useAuth()
  const [isOnline, setIsOnline] = useState(true)

  if (!user || user.role !== "business") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>A service provider account is required to view this page.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/auth/login")}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.businessAvatar}>
            <Text style={styles.businessAvatarText}>{user.business?.name?.charAt(0) || "B"}</Text>
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{user.business?.name || "My Business"}</Text>
            <Text style={styles.businessType}>
              {user.business?.type === "salon"
                ? "Beauty Salon"
                : user.business?.type === "barber"
                ? "Barber"
                : user.business?.type === "spa"
                ? "Spa & Massage"
                : user.business?.type === "nail"
                ? "Nail Care"
                : "Other"}
            </Text>
          </View>
        </View>

        <View style={styles.onlineStatusContainer}>
          <Text style={styles.onlineStatusText}>Business Status: {isOnline ? "Online" : "Offline"}</Text>
          <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: "#ddd", true: "#1B9AAA" }} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Business Information</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/business/business-details")}>
          <Ionicons name="business-outline" size={24} color="#1B9AAA" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Business Details</Text>
            <Text style={styles.menuItemDescription}>Business name, type, and description</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/business/business-address")}>
          <Ionicons name="location-outline" size={24} color="#1B9AAA" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Address Information</Text>
            <Text style={styles.menuItemDescription}>Location and contact information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/business/working-hours")}>
          <Ionicons name="time-outline" size={24} color="#1B9AAA" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Working Hours</Text>
            <Text style={styles.menuItemDescription}>Business operating days and hours</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/business/account-settings")}>
          <Ionicons name="settings-outline" size={24} color="#1B9AAA" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Account Settings</Text>
            <Text style={styles.menuItemDescription}>Password change and security</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/business/notifications-settings")}>
          <Ionicons name="notifications-outline" size={24} color="#1B9AAA" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Notification Settings</Text>
            <Text style={styles.menuItemDescription}>Notification preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/business/payment-settings")}>
          <Ionicons name="card-outline" size={24} color="#1B9AAA" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Payment Settings</Text>
            <Text style={styles.menuItemDescription}>Payment methods and billing information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/business/help-center")}>
          <Ionicons name="help-circle-outline" size={24} color="#1B9AAA" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Help Center</Text>
            <Text style={styles.menuItemDescription}>FAQ and support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/business/contact-support")}>
          <Ionicons name="chatbubble-outline" size={24} color="#1B9AAA" />
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Contact Support Team</Text>
            <Text style={styles.menuItemDescription}>Report an issue or send a suggestion</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            logout()
            router.replace("/auth/login")
          }}
        >
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  businessAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1B9AAA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  businessAvatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  businessType: {
    fontSize: 16,
    color: "#666",
  },
  onlineStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  onlineStatusText: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 3,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 100,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
