import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback and support</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.supportItem}>
          <Text style={styles.supportItemText}>Like us on Facebook</Text>
          <TouchableOpacity style={styles.likeButton}>
            <Ionicons name="thumbs-up" size={16} color="#3b5998" />
            <Text style={styles.likeButtonText}>Like</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.supportItem}>
          <Text style={styles.supportItemText}>Rate Booksy in App Store</Text>
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
  },
  supportItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  supportItemText: {
    fontSize: 16,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  likeButtonText: {
    fontSize: 14,
    color: "#3b5998",
    marginLeft: 5,
  },
})

