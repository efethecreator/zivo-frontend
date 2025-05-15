"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"
import { updateMyProfile } from "../services/user.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function AccountDetailsScreen() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()

  const [fullName, setFullName] = useState(user?.fullName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.profile?.phone || "")
  const [location, setLocation] = useState(user?.profile?.location || "")
  const [gender, setGender] = useState(user?.profile?.gender || "")
  const [biography, setBiography] = useState(user?.profile?.biography || "")
  

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ["user"] })
      Alert.alert("Success", "Profile updated successfully")
      router.push("/(tabs)/profile")
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to update profile. Please try again.")
    },
  })

  const handleSave = () => {
    if (!user) return

    const profileData = {
      phone,
      location,
      gender,
      biography,
    }

    updateProfileMutation.mutate(profileData)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
          />
        </View>

        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderButton, gender === "Male" && styles.genderButtonActive]}
            onPress={() => setGender("Male")}
          >
            <Text style={styles.genderText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, gender === "Female" && styles.genderButtonActive]}
            onPress={() => setGender("Female")}
          >
            <Text style={styles.genderText}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, gender === "Other" && styles.genderButtonActive]}
            onPress={() => setGender("Other")}
          >
            <Text style={styles.genderText}>Other</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Biography</Text>
          <TextInput
            style={[styles.input, styles.biographyInput]}
            value={biography}
            onChangeText={setBiography}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />
        </View>


        <TouchableOpacity style={styles.deleteAccountButton} onPress={() => router.push("/(tabs)")}>
          <Text style={styles.deleteAccountText}>Account deletion process</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={updateProfileMutation.isPending}>
        <Text style={styles.saveButtonText}>{updateProfileMutation.isPending ? "Saving..." : "Save"}</Text>
      </TouchableOpacity>
    </View>
  )
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
    fontFamily: "Outfit-Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    fontFamily: "Outfit-Bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontFamily: "Outfit-Regular",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: "Outfit-Regular",
  },
  biographyInput: {
    height: 100,
    textAlignVertical: "top",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 5,
    borderRadius: 8,
  },
  genderButtonActive: {
    backgroundColor: "#2596be",
  },
  genderText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Outfit-Regular",
  },
  deleteAccountButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: 20,
  },
  deleteAccountText: {
    fontSize: 16,
    color: "#E53935",
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
})
