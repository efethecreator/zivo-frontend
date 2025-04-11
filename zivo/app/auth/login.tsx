import React, { useState } from "react";
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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      login({ email });
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1000);
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
          <Text style={styles.title}>Get started</Text>
          <TouchableOpacity style={styles.languageSelector}>
            {/* Dil seçici içeriği */}
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Create an account or log in to book and manage your appointments.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholderTextColor={"#8888"}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Loading..." : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={[styles.button, styles.socialButton]}>
          <Ionicons name="logo-apple" size={20} color="#000" />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.socialButton]}>
          <Image
            source={require("../../assets/images/logo-google.jpg")}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.socialButton]}>
          <Ionicons name="logo-facebook" size={20} color="#1877F2" />
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#1B9AAA",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  registerText: {
    color: "#1B9AAA",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },
});
