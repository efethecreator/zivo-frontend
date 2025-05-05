import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddressScreen() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postCode, setPostCode] = useState("");

  useEffect(() => {
    if (user?.profile?.location) {
      const addressParts = user.profile.location.split(",");
      if (addressParts.length >= 3) {
        setStreet(addressParts[0].trim());
        setCity(addressParts[addressParts.length - 2].trim());
        setPostCode(addressParts[addressParts.length - 1].trim());

        // Apartment number is optional, so check if it exists
        if (addressParts.length === 4) {
          setApartment(addressParts[1].trim());
        }
      }
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      Alert.alert("Success", "Address updated successfully");
      router.push("/(tabs)/profile");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to update address. Please try again.");
    },
  });

  const handleSave = () => {
    if (!user) return;

    const location = `${street}, ${
      apartment ? apartment + ", " : ""
    }${city}, ${postCode}`;

    const profileData = {
      location,
    };

    updateProfileMutation.mutate(profileData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Street</Text>
          <TextInput
            style={styles.input}
            value={street}
            onChangeText={setStreet}
            placeholder="Enter street name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Apartment or Suite Number (optional)
          </Text>
          <TextInput
            style={styles.input}
            value={apartment}
            onChangeText={setApartment}
            placeholder="Enter apartment or suite number"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Enter city"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Post Code</Text>
          <TextInput
            style={styles.input}
            value={postCode}
            onChangeText={setPostCode}
            placeholder="Enter post code"
            keyboardType="number-pad"
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={updateProfileMutation.isPending}
      >
        <Text style={styles.saveButtonText}>
          {updateProfileMutation.isPending ? "Saving..." : "Save"}
        </Text>
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
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: "Outfit-Regular",
  },
  saveButton: {
    backgroundColor: "#2596be",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Outfit-Bold",
  },
});
