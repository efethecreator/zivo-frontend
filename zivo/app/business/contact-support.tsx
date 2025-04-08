// app/business/contact-support.tsx
"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export const unstable_settings = {
  unstable_ignoreRoute: true,
};


export default function ContactSupportScreen() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Hata", "Lütfen konu ve mesaj alanlarını doldurun.");
      return;
    }

    // Burada destek mesajı gönderme işlemi yapılacak
    Alert.alert(
      "Başarılı",
      "Destek talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
      [{ text: "Tamam", onPress: () => router.back() }]
    );
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
        <Text style={styles.headerTitle}>Destek Ekibiyle İletişim</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Sorunlarınız veya önerileriniz için destek ekibimizle iletişime geçebilirsiniz. En kısa sürede size dönüş yapacağız.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                category === "general" && styles.activeCategoryButton,
              ]}
              onPress={() => setCategory("general")}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === "general" && styles.activeCategoryButtonText,
                ]}
              >
                Genel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                category === "technical" && styles.activeCategoryButton,
              ]}
              onPress={() => setCategory("technical")}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === "technical" && styles.activeCategoryButtonText,
                ]}
              >
                Teknik
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                category === "billing" && styles.activeCategoryButton,
              ]}
              onPress={() => setCategory("billing")}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === "billing" && styles.activeCategoryButtonText,
                ]}
              >
                Ödeme
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                category === "other" && styles.activeCategoryButton,
              ]}
              onPress={() => setCategory("other")}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === "other" && styles.activeCategoryButtonText,
                ]}
              >
                Diğer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Konu</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Konu başlığı girin"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mesaj</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Mesajınızı detaylı bir şekilde yazın"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.contactInfoContainer}>
          <Text style={styles.contactInfoTitle}>Diğer İletişim Kanalları</Text>
          <View style={styles.contactInfoItem}>
            <Ionicons name="mail-outline" size={20} color="#1B9AAA" />
            <Text style={styles.contactInfoText}>support@zivo.com</Text>
          </View>
          <View style={styles.contactInfoItem}>
            <Ionicons name="call-outline" size={20} color="#1B9AAA" />
            <Text style={styles.contactInfoText}>+90 (212) 123 45 67</Text>
          </View>
          <View style={styles.contactInfoItem}>
            <Ionicons name="time-outline" size={20} color="#1B9AAA" />
            <Text style={styles.contactInfoText}>
              Pazartesi - Cuma: 09:00 - 18:00
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Gönder</Text>
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
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    marginBottom: 10,
  },
  activeCategoryButton: {
    backgroundColor: "#1B9AAA",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activeCategoryButtonText: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 150,
  },
  contactInfoContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  contactInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  contactInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactInfoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
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