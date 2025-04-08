// app/business/business-address.tsx
"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export const unstable_settings = {
  unstable_ignoreRoute: true,
};


export default function BusinessAddressScreen() {
  const { user, updateUser } = useAuth();
  const [street, setStreet] = useState(user?.business?.address?.street || "");
  const [city, setCity] = useState(user?.business?.address?.city || "");
  const [district, setDistrict] = useState(user?.business?.address?.district || "");
  const [postCode, setPostCode] = useState(user?.business?.address?.postCode || "");
  const [phone, setPhone] = useState(user?.business?.phone || "");
  const [email, setEmail] = useState(user?.business?.email || "");
  const [website, setWebsite] = useState(user?.business?.website || "");

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        business: {
          ...user.business,
          address: {
            street,
            city,
            district,
            postCode,
          },
          phone,
          email,
          website,
        },
      });
      router.back();
    }
  };

  if (!user || user.role !== "business") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Bu sayfayı görüntülemek için hizmet veren hesabı gereklidir.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/business/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adres ve İletişim</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adres Bilgileri</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cadde/Sokak ve Bina No</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Cadde/Sokak ve Bina No girin"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>İlçe</Text>
            <TextInput
              style={styles.input}
              value={district}
              onChangeText={setDistrict}
              placeholder="İlçe girin"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Şehir</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Şehir girin"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Posta Kodu</Text>
            <TextInput
              style={styles.input}
              value={postCode}
              onChangeText={setPostCode}
              placeholder="Posta kodu girin"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="İşletme telefon numarası girin"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="İşletme e-posta adresi girin"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Web Sitesi (İsteğe bağlı)</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="Web sitesi adresinizi girin"
              keyboardType="url"
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
});