"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { StatusBar } from "expo-status-bar"
import { useLoginMutation } from "../../services/auth.service"
import { useQueryClient } from "@tanstack/react-query"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { normalize, fontSizes, spacing } from "../../utils/responsive"
import { KeyboardAvoidingContainer } from "../../components/KeyboardAvoidingContainer"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, resetAuth } = useAuth()
  const loginMutation = useLoginMutation()
  const queryClient = useQueryClient()
  const insets = useSafeAreaInsets()

  // Component mount olduğunda auth durumunu sıfırla
  useEffect(() => {
    const prepareLogin = async () => {
      console.log("🔄 Login ekranı hazırlanıyor, auth durumu sıfırlanıyor...")
      await resetAuth()

      // Query cache'i temizle
      queryClient.clear()
      console.log("🧹 Query cache temizlendi")
    }

    prepareLogin()
  }, [])

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun")
      return
    }

    try {
      console.log(`🔑 ${email} hesabına giriş yapılıyor...`)

      // Login işlemini gerçekleştir
      await login({ email, password })

      console.log(`✅ ${email} hesabına giriş başarılı, yönlendiriliyor...`)

      // Query cache'i temizle
      queryClient.clear()
      console.log("🧹 Query cache temizlendi")

      // Kısa bir gecikme ekle
      setTimeout(() => {
        router.replace("/(tabs)")
      }, 300)
    } catch (error) {
      console.error("❌ Login error:", error)
      Alert.alert("Hata", "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Durum çubuğu ayarı: beyaz arka plan üzerine siyah ikonlar */}
      <StatusBar style="dark" backgroundColor="#fff" />

      <KeyboardAvoidingContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image source={require("../../assets/images/logo.jpg")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to your account</Text>
          </View>

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
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={normalize(20)} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.buttonText}>{loginMutation.isPending ? "Loading..." : "Sign In"}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={[styles.button, styles.socialButton]}>
              <Ionicons name="logo-apple" size={normalize(20)} color="#000" />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.socialButton]}>
              <Ionicons name="logo-google" size={normalize(20)} color="#DB4437" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.socialButton]}>
              <Ionicons name="logo-facebook" size={normalize(20)} color="#4267B2" />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingContainer>
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
    paddingHorizontal: spacing.l,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.l,
    paddingTop: spacing.m,
  },
  logo: {
    width: normalize(150),
    height: normalize(150),
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSizes.header,
    fontWeight: "bold",
    marginBottom: spacing.xs,
    fontFamily: "Outfit-Bold",
  },
  subtitle: {
    fontSize: fontSizes.m,
    color: "#666",
    textAlign: "center",
    fontFamily: "Outfit-Light",
  },
  inputContainer: {
    marginBottom: spacing.m,
    width: "100%",
  },
  label: {
    fontSize: fontSizes.m,
    color: "#1B9AAA",
    marginBottom: spacing.xs,
    fontFamily: "Outfit-Regular",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: spacing.m,
    fontSize: fontSizes.m,
    fontFamily: "Outfit-Light",
    height: normalize(45),
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    height: normalize(45),
  },
  passwordInput: {
    flex: 1,
    padding: spacing.m,
    fontSize: fontSizes.m,
    fontFamily: "Outfit-Light",
  },
  eyeIcon: {
    paddingHorizontal: spacing.s,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: spacing.m,
  },
  forgotPasswordText: {
    color: "#1B9AAA",
    fontSize: fontSizes.s,
    fontFamily: "Outfit-Light",
  },
  button: {
    borderRadius: 8,
    padding: spacing.s,
    alignItems: "center",
    marginBottom: spacing.s,
    height: normalize(50),
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#1B9AAA",
  },
  buttonText: {
    color: "#fff",
    fontSize: fontSizes.l,
    fontWeight: "600",
    fontFamily: "Outfit-Regular",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.m,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: spacing.s,
    color: "#666",
    fontFamily: "Outfit-Light",
    fontSize: fontSizes.s,
  },
  socialButtons: {
    gap: spacing.xs,
  },
  socialButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    gap: spacing.s,
    justifyContent: "center",
    height: normalize(50),
  },
  socialButtonText: {
    color: "#000",
    fontSize: fontSizes.l,
    fontWeight: "600",
    fontFamily: "Outfit-Light",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
    gap: 5,
  },
  footerText: {
    color: "#666",
    fontSize: fontSizes.l,
    fontFamily: "Outfit-Light",
  },
  footerLink: {
    color: "#1B9AAA",
    fontSize: fontSizes.l,
    fontWeight: "600",
    fontFamily: "Outfit-Regular",
  },
})
