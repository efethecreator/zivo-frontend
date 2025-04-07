import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function ReviewsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>REVIEWS</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Image
          source={{
            uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reviews.jpg-f5udk4A5cDGCOMIsqf2YVmaFw3uXCm.jpeg",
          }}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.title}>Your reviews</Text>

        <Text style={styles.description}>Share experiences after your appointments!</Text>

        <Text style={styles.subDescription}>All of your reviews will show up here.</Text>
      </ScrollView>

      <TouchableOpacity style={styles.bookNowButton}>
        <Text style={styles.bookNowButtonText}>Book Now</Text>
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
    textAlign: "center",
    flex: 1,
    marginRight: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  illustration: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  subDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  bookNowButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  bookNowButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

