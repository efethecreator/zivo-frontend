"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, uploadProfilePhoto } from "../../services/user.service";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalize, fontSizes, spacing } from "../../utils/responsive";
import { SafeAreaWrapper } from "../../components/SafeAreaWrapper";

export default function ProfileScreen() {
  const {
    user: authUser,
    isLoading: isAuthLoading,
    updateUser: updateAuthUser,
    logout,
  } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const insets = useSafeAreaInsets();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getMe,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: (updatedUser) => {
      // Update the user in the auth context
      updateAuthUser(updatedUser);
      // Invalidate the user query to refetch
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      router.replace("/auth/login");
    }
  }, [authUser, isAuthLoading]);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your camera"
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setUploading(true);
      await uploadMutation.mutateAsync(imageUri);
      Alert.alert("Success", "Profile photo updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Çıkış yapılıyor...");
      await logout();
    } catch (error) {
      console.error("❌ Çıkış yapılırken hata:", error);
      Alert.alert(
        "Hata",
        "Çıkış yapılırken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  if (isAuthLoading || isUserLoading || !authUser || !user) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2596be" />
      </View>
    );
  }

  return (
    <SafeAreaWrapper style={styles.container} backgroundColor="#fff">
      <StatusBar style="dark" backgroundColor="#fff" />

      {/* Sabit Kısım */}
      <View style={[styles.profileHeader, { paddingTop: normalize(20) }]}>
        <View style={styles.avatarWrapper}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={showImageOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : user.profile?.photoUrl ? (
              <Image
                source={{ uri: user.profile.photoUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {user.fullName.charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>

          {/* Artık ayrı dışta bir TouchableOpacity */}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={showImageOptions}
            disabled={uploading}
          >
            <Ionicons name="camera" size={normalize(20)} color="#fff" />
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
        contentContainerStyle={{ paddingBottom: insets.bottom + normalize(20) }}
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
              <Ionicons
                name="chevron-forward"
                size={normalize(20)}
                color="#ccc"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={normalize(20)} color="#ccc" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
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
    padding: normalize(70),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scrollArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  avatarWrapper: {
    position: "relative",
    width: normalize(100),
    height: normalize(100),
    marginBottom: spacing.s,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    width: normalize(100),
    height: normalize(100),
    borderRadius: normalize(50),
    backgroundColor: "#8D6E63",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: fontSizes.xxxl,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Outfit-Bold",
  },
  cameraButton: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#1B9AAA",
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  userName: {
    fontSize: fontSizes.xxl,
    fontWeight: "bold",
    marginBottom: spacing.xs,
    fontFamily: "Outfit-Bold",
  },
  userPhone: {
    fontSize: fontSizes.l,
    color: "#666",
    fontFamily: "Outfit-Light",
  },
  menuSection: {
    marginBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: fontSizes.l,
    fontFamily: "Outfit-Regular",
  },
  logoutButton: {
    marginTop: -normalize(20),
  },
  logoutText: {
    color: "#666",
    fontFamily: "Outfit-Light",
  },
});
