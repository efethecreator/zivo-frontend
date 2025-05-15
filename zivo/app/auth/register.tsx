"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { StatusBar } from "expo-status-bar"
import { useRegisterMutation, login } from "../../services/auth.service"
import { updateMyProfile } from "../../services/user.service"

const { width } = Dimensions.get("window")
const inputWidth = Math.min(width - 40, 400)

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const registerMutation = useRegisterMutation()

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      // ✅ Önce register işlemi
      await register({
        fullName,
        email,
        password,
        phone,
        userType: "customer",
      })

      // ✅ Sonra login işlemi
      const loginResponse = await login(email, password)

      console.log("[Auth] ✅ Login success:", loginResponse)

      // ✅ Update the user's profile with the phone number
      try {
        await updateMyProfile({ phone })
        console.log("[Profile] ✅ Phone number updated in profile")
      } catch (profileError) {
        console.error("[Profile] ❌ Failed to update phone in profile:", profileError)
        // Continue with registration even if profile update fails
      }

      router.replace("/(tabs)")
    } catch (error) {
      console.error("[Register] ❌ Error:", error)
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to register. Please try again.")
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.push("/auth/login")}>
            <Ionicons name="arrow-back" size={22} color="#2596be" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image source={require("../../assets/images/logo.jpg")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to book and manage your appointments</Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={"#8888"}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={"#8888"}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={"#8888"}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholderTextColor={"#8888"}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleRegister}
            disabled={registerMutation.isPending}
          >
            <Text style={styles.buttonText}>{registerMutation.isPending ? "Loading..." : "Sign Up"}</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Logins */}
          <View style={styles.socialButtons}>
            <TouchableOpacity style={[styles.button, styles.socialButton]}>
              <Ionicons name="logo-apple" size={18} color="#000" />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.socialButton]}>
              <Ionicons name="logo-google" size={18} color="#DB4437" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.socialButton]}>
              <Ionicons name="logo-facebook" size={18} color="#4267B2" />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 0,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Outfit-Bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: "Outfit-Light",
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 16,
    width: "100%",
    alignSelf: "center",
    maxWidth: inputWidth,
  },
  label: {
    fontSize: 13,
    color: "#2596be",
    marginBottom: 6,
    fontFamily: "Outfit-Regular",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Outfit-Light",
    height: 45,
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    height: 45,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Outfit-Light",
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
    alignSelf: "center",
    maxWidth: inputWidth,
    height: 45,
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2596be",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Outfit-Light",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    width: "100%",
    maxWidth: inputWidth,
    alignSelf: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
    fontSize: 13,
  },
  socialButtons: {
    gap: 8,
    width: "100%",
    alignSelf: "center",
    maxWidth: inputWidth,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f5f5f5",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 5,
  },
  footerText: {
    color: "#666",
    fontSize: 13,
  },
  footerLink: {
    color: "#2596be",
    fontWeight: "600",
    fontSize: 13,
  },
})
