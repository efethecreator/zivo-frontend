import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function FamilyFriendsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Image
          source={{ uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/familyfirends.jpg-guBYyNvODTLjrftGsVGPzygX8zM0Ns.jpeg" }}
          style={styles.illustration}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Add Your Family & Friends</Text>
        
        <Text style={styles.description}>
          Link an account to schedule appointments on behalf of others – a
          child, family member, partner, or even a pet. You will be able to
          manage their appointments, receive notifications, and make
          payments
        </Text>

        <TouchableOpacity style={styles.learnMoreButton}>
          <Text style={styles.learnMoreText}>Learn more</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.addMemberButton}>
        <Text style={styles.addMemberButtonText}>Add Member</Text>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  illustration: {
    width: 300,
    height: 200,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  learnMoreButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  learnMoreText: {
    fontSize: 16,
    color: "#666",
  },
  addMemberButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  addMemberButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
