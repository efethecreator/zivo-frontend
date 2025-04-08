// app/business/notifications-settings.tsx
"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export const unstable_settings = {
  unstable_ignoreRoute: true,
};


export default function NotificationsSettingsScreen() {
  const { user } = useAuth();
  const [newAppointmentPush, setNewAppointmentPush] = useState(true);
  const [newAppointmentEmail, setNewAppointmentEmail] = useState(true);
  const [newAppointmentSMS, setNewAppointmentSMS] = useState(false);
  
  const [cancelledAppointmentPush, setCancelledAppointmentPush] = useState(true);
  const [cancelledAppointmentEmail, setCancelledAppointmentEmail] = useState(true);
  const [cancelledAppointmentSMS, setCancelledAppointmentSMS] = useState(false);
  
  const [reminderPush, setReminderPush] = useState(true);
  const [reminderEmail, setReminderEmail] = useState(false);
  const [reminderSMS, setReminderSMS] = useState(false);
  
  const [marketingPush, setMarketingPush] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(true);
  const [marketingSMS, setMarketingSMS] = useState(false);

  const handleSave = () => {
    // Burada bildirim ayarlarını kaydetme işlemi yapılacak
    router.back();
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
        <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yeni Randevu Bildirimleri</Text>
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>Uygulama Bildirimleri</Text>
          <Switch
            value={newAppointmentPush}
            onValueChange={setNewAppointmentPush}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>E-posta Bildirimleri</Text>
          <Switch
            value={newAppointmentEmail}
            onValueChange={setNewAppointmentEmail}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>SMS Bildirimleri</Text>
          <Switch
            value={newAppointmentSMS}
            onValueChange={setNewAppointmentSMS}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>İptal Edilen Randevu Bildirimleri</Text>
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>Uygulama Bildirimleri</Text>
          <Switch
            value={cancelledAppointmentPush}
            onValueChange={setCancelledAppointmentPush}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>E-posta Bildirimleri</Text>
          <Switch
            value={cancelledAppointmentEmail}
            onValueChange={setCancelledAppointmentEmail}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>SMS Bildirimleri</Text>
          <Switch
            value={cancelledAppointmentSMS}
            onValueChange={setCancelledAppointmentSMS}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Randevu Hatırlatıcıları</Text>
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>Uygulama Bildirimleri</Text>
          <Switch
            value={reminderPush}
            onValueChange={setReminderPush}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>E-posta Bildirimleri</Text>
          <Switch
            value={reminderEmail}
            onValueChange={setReminderEmail}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>SMS Bildirimleri</Text>
          <Switch
            value={reminderSMS}
            onValueChange={setReminderSMS}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pazarlama Bildirimleri</Text>
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>Uygulama Bildirimleri</Text>
          <Switch
            value={marketingPush}
            onValueChange={setMarketingPush}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>E-posta Bildirimleri</Text>
          <Switch
            value={marketingEmail}
            onValueChange={setMarketingEmail}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
          />
        </View>

        <View style={styles.notificationItem}>
          <Text style={styles.notificationText}>SMS Bildirimleri</Text>
          <Switch
            value={marketingSMS}
            onValueChange={setMarketingSMS}
            trackColor={{ false: "#ddd", true: "#1B9AAA" }}
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
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationText: {
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