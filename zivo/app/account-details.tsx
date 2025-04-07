import React, { useState } from "react";
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
import { useAuth } from "../context/AuthContext";

export default function AccountDetailsScreen() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [serviceType, setServiceType] = useState("men");

  const handleSave = () => {
    if (user) {
      updateUser({ ...user, name, email, phone });
      router.push("/(tabs)/profile");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Personal details</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>First and last name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Birth date</Text>
          <TouchableOpacity style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>
              {birthDate || "Select date"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <View>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <View>
            <Text style={styles.detailLabel}>Phone number</Text>
            <Text style={styles.detailValue}>{phone}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Services type</Text>

        <View style={styles.serviceTypeContainer}>
          <TouchableOpacity
            style={[
              styles.serviceTypeButton,
              serviceType === "women" && styles.serviceTypeButtonActive,
            ]}
            onPress={() => setServiceType("women")}
          >
            <Text style={styles.serviceTypeText}>Women</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.serviceTypeButton,
              serviceType === "men" && styles.serviceTypeButtonActive,
            ]}
            onPress={() => setServiceType("men")}
          >
            <Text style={styles.serviceTypeText}>Men</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.serviceTypeButton,
              serviceType === "everyone" && styles.serviceTypeButtonActive,
            ]}
            onPress={() => setServiceType("everyone")}
          >
            <Text style={styles.serviceTypeText}>Everyone</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.deleteAccountButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.deleteAccountText}>Account deletion process</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
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
    fontWeight: "bold",
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
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: "#666",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: "#000",
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  editButtonText: {
    fontSize: 16,
    color: "#000",
  },
  serviceTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  serviceTypeButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  serviceTypeButtonActive: {
    backgroundColor: "#fff",
  },
  serviceTypeText: {
    fontSize: 16,
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
});
