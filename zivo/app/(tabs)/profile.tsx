import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../services/user.service";
import { StatusBar } from "expo-status-bar";
import { logout } from "../../app/auth/logout"; // yoluna göre düzenle

export default function ProfileScreen() {
  const { user: authUser, isLoading: isAuthLoading } = useAuth();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getMe,
  });

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      router.replace("/auth/login");
    }
  }, [authUser, isAuthLoading]);

  if (isAuthLoading || isUserLoading || !authUser || !user) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2596be" />
      </View>
    );
  }

  const handleLogout = () => {
    logout();
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fff" />

      {/* Sabit Kısım */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user.profile?.photoUrl ? (
            <Image
              source={{ uri: user.profile.photoUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {user.fullName.charAt(0).toUpperCase()}
            </Text>
          )}
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user.fullName}</Text>
        <Text style={styles.userPhone}>
          {user.profile?.phone || user.phone || "No phone number"}
        </Text>
      </View>

      {/* Kaydırılabilir Kısım */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuSection}>
          {[
            { label: "Account Details", path: "/account-details" },
            { label: "Address", path: "/address" },
            { label: "Reviews", path: "/reviews" },
            { label: "Payments", path: "/payments" },
            { label: "Your Privacy", path: "/privacy" },
            { label: "Settings", path: "/settings" },
            { label: "Feedback and support", path: "/support" },
            { label: "About ZIVO", path: "/about" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigateTo(item.path)}
            >
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    padding: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scrollArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8D6E63",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1B9AAA",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: "#666",
  },
  menuSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: -20,
  },
  logoutText: {
    color: "#666",
  },
});
