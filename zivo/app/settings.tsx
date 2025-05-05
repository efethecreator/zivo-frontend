"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const [language, setLanguage] = useState("Automatic (İngilizce)");
  const [country, setCountry] = useState("Nederland");
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(true);
  const [appleConnected, setAppleConnected] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>NOTIFICATIONS</Text>
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <Text style={styles.settingItemText}>
            Enable notifications (Phone Settings)
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>SETTINGS</Text>
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <Text style={styles.settingItemText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <View>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>{language}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <View>
            <Text style={styles.settingLabel}>Country</Text>
            <Text style={styles.settingValue}>{country}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <View>
            <Text style={styles.settingLabel}>Facebook</Text>
            <Text style={styles.settingValue}>Not Connected</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.facebookConnectButton}
          onPress={() => setFacebookConnected(true)}
        >
          <Ionicons name="logo-facebook" size={20} color="#fff" />
          <Text style={styles.connectButtonText}>Connect With Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <View>
            <Text style={styles.settingLabel}>Google</Text>
            <Text style={styles.settingValue}>Connected</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <View>
            <Text style={styles.settingLabel}>Apple</Text>
            <Text style={styles.settingValue}>Not Connected</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.appleConnectButton}
          onPress={() => setAppleConnected(true)}
        >
          <Ionicons name="logo-apple" size={20} color="#fff" />
          <Text style={styles.connectButtonText}>Connect with Apple</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginRight: 40,
    fontFamily: "Outfit-Bold",
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingItemText: {
    fontSize: 16,
    fontFamily: "Outfit-Regular",
  },
  settingLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  settingValue: {
    fontSize: 16,
  },
  facebookConnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b5998",
    padding: 12,
    margin: 20,
    borderRadius: 5,
  },
  appleConnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    padding: 12,
    margin: 20,
    borderRadius: 5,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "Outfit-Regular",
  },
});
