// app/business/account-settings.tsx
"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"

export const unstable_settings = {
  unstable_ignoreRoute: true,
}

export default function AccountSettingsScreen() {
  const { user, updateUser } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChangePassword = () => {
    // Burada gerçek bir şifre değiştirme işlemi yapılacak
    // Şimdilik sadece basit bir kontrol yapıyoruz
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation password do not match.")
      return
    }

    // Başarılı şifre değiştirme
    Alert.alert("Success", "Your password has been changed successfully.")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

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
        <TouchableOpacity onPress={() => router.replace("/business/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter your current password"
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <Ionicons name={showCurrentPassword ? "eye-off" : "eye"} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password (Confirm)</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Enter your new password again"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
            <Text style={styles.changePasswordButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>

          <TouchableOpacity style={styles.securityOption}>
            <View style={styles.securityOptionContent}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1B9AAA" />
              <View style={styles.securityOptionText}>
                <Text style={styles.securityOptionTitle}>Two-Factor Authentication</Text>
                <Text style={styles.securityOptionDescription}>
                  Enable two-factor authentication to protect your account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.securityOption}>
            <View style={styles.securityOptionContent}>
              <Ionicons name="lock-closed-outline" size={24} color="#1B9AAA" />
              <View style={styles.securityOptionText}>
                <Text style={styles.securityOptionTitle}>Login History</Text>
                <Text style={styles.securityOptionDescription}>View recent login activities to your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>

          <TouchableOpacity style={styles.securityOption}>
            <View style={styles.securityOptionContent}>
              <Ionicons name="download-outline" size={24} color="#1B9AAA" />
              <View style={styles.securityOptionText}>
                <Text style={styles.securityOptionTitle}>Download My Data</Text>
                <Text style={styles.securityOptionDescription}>Download all data from your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteAccountOption}>
            <View style={styles.securityOptionContent}>
              <Ionicons name="trash-outline" size={24} color="#E53935" />
              <View style={styles.securityOptionText}>
                <Text style={styles.deleteAccountTitle}>Delete My Account</Text>
                <Text style={styles.securityOptionDescription}>Permanently delete your account and all your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  changePasswordButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  changePasswordButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  securityOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  securityOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  securityOptionText: {
    marginLeft: 15,
    flex: 1,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  securityOptionDescription: {
    fontSize: 14,
    color: "#666",
  },
  deleteAccountOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  deleteAccountTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#E53935",
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
