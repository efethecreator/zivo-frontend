import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About ZIVO</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: "https://placeholder.svg?height=100&width=100" }} style={styles.logo} />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About Us</Text>
          <Text style={styles.aboutText}>
            ZIVO is a platform that connects customers with service providers. Our mission is to make booking
            appointments easy and convenient for everyone.
          </Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Contact</Text>
          <Text style={styles.aboutText}>
            Email: support@zivo.com{"\n"}
            Phone: +1 (123) 456-7890{"\n"}
            Address: 123 Main St, City, Country
          </Text>
        </View>

        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Licenses</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </ScrollView>
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
    textAlign: "center",
    flex: 1,
    marginRight: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  version: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  linkText: {
    fontSize: 16,
  },
})

