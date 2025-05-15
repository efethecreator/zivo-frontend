"use client";

import { useState, useEffect } from "react";
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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useLoginMutation } from "../../services/auth.service";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, resetAuth } = useAuth();
  const loginMutation = useLoginMutation();
  const queryClient = useQueryClient();

  // Component mount olduğunda auth durumunu sıfırla
  useEffect(() => {
    const prepareLogin = async () => {
      console.log("🔄 Login ekranı hazırlanıyor, auth durumu sıfırlanıyor...");
      await resetAuth();

      // Query cache'i temizle
      queryClient.clear();
      console.log("🧹 Query cache temizlendi");
    };

    prepareLogin();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun");
      return;
    }

    try {
      console.log(`🔑 ${email} hesabına giriş yapılıyor...`);

      // Login işlemini gerçekleştir
      await login({ email, password });

      console.log(`✅ ${email} hesabına giriş başarılı, yönlendiriliyor...`);

      // Query cache'i temizle
      queryClient.clear();
      console.log("🧹 Query cache temizlendi");

      // Kısa bir gecikme ekle
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 300);
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert(
        "Hata",
        "Giriş başarısız. Lütfen bilgilerinizi kontrol edin."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Durum çubuğu ayarı: beyaz arka plan üzerine siyah ikonlar */}
      <StatusBar style="dark" backgroundColor="#fff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue to your account
          </Text>
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
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
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
          <Text style={styles.buttonText}>
            {loginMutation.isPending ? "Loading..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={[styles.button, styles.socialButton]}>
            <Ionicons name="logo-apple" size={24} color="#000" />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.socialButton]}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.socialButton]}>
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/register")}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    fontFamily: "Outfit-Regular",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Outfit-Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontFamily: "Outfit-Light",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#1B9AAA",
    marginBottom: 8,
    fontFamily: "Outfit-Regular",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: "Outfit-Light",
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#1B9AAA",
    fontSize: 14,
    fontFamily: "Outfit-Light",
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: "#1B9AAA",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit-Light",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
    fontFamily: "Outfit-Light",
  },
  socialButtons: {
    gap: 10,
  },
  socialButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    gap: 10,
  },
  socialButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit-Light",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 5,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
    fontFamily: "Outfit-Light",
  },
  footerLink: {
    color: "#1B9AAA",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Outfit-Light",
  },
});
