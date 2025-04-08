// app/business/business-details.tsx
"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export const unstable_settings = {
  unstable_ignoreRoute: true,
};


export default function BusinessDetailsScreen() {
  const { user, updateUser } = useAuth();
  const [businessName, setBusinessName] = useState(user?.business?.name || "");
  const [businessType, setBusinessType] = useState(user?.business?.type || "salon");
  const [description, setDescription] = useState(user?.business?.description || "");
  const [logo, setLogo] = useState(user?.business?.logo || null);

  const businessTypes = [
    { id: "salon", name: "Güzellik Salonu" },
    { id: "barber", name: "Berber" },
    { id: "spa", name: "Spa & Masaj" },
    { id: "nail", name: "Tırnak Bakımı" },
    { id: "other", name: "Diğer" },
  ];

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        business: {
          ...user.business,
          name: businessName,
          type: businessType,
          description: description,
          logo: logo,
        },
      });
      router.back();
    }
  };

  const handleUploadLogo = () => {
    // Burada gerçek bir resim yükleme işlemi yapılacak
    // Şimdilik sadece bir placeholder kullanıyoruz
    setLogo("https://placeholder.svg?height=200&width=200");
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
        <Text style={styles.headerTitle}>İşletme Detayları</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          {logo ? (
            <Image source={{ uri: logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>
                {businessName ? businessName.charAt(0).toUpperCase() : "B"}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadLogo}>
            <Text style={styles.uploadButtonText}>Logo Yükle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>İşletme Adı</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="İşletme adını girin"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>İşletme Türü</Text>
          <View style={styles.businessTypeContainer}>
            {businessTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.businessTypeButton,
                  businessType === type.id && styles.businessTypeButtonActive,
                ]}
                onPress={() => setBusinessType(type.id)}
              >
                <Text
                  style={[
                    styles.businessTypeText,
                    businessType === type.id && styles.businessTypeTextActive,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>İşletme Açıklaması</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="İşletmenizi kısaca tanıtın"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1B9AAA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logoPlaceholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  uploadButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  uploadButtonText: {
    fontSize: 14,
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
  textArea: {
    height: 120,
  },
  businessTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  businessTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    marginBottom: 10,
  },
  businessTypeButtonActive: {
    backgroundColor: "#1B9AAA",
  },
  businessTypeText: {
    fontSize: 14,
    color: "#333",
  },
  businessTypeTextActive: {
    color: "#fff",
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