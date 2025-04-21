"use client"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, SafeAreaView } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { getAllBusinesses } from "../../services/business.service"
import { getMyAppointments } from "../../services/appointment.service"
import type { Business } from "../../types"

const categories = [
  {
    id: "massage",
    name: "Massage",
    icon: require("../../assets/images/images.jpeg"),
  },
  {
    id: "spa",
    name: "Day SPA",
    icon: require("../../assets/images/spa.jpg"),
  },
  {
    id: "skin",
    name: "Skin care",
    icon: require("../../assets/images/Facial-providence-ri.jpg"),
  },
  {
    id: "pet",
    name: "Pet services",
    icon: require("../../assets/images/pet-sitters.jpg"),
  },
  {
    id: "hair",
    name: "Hair salons",
    icon: require("../../assets/images/24pt-tif-gould-sprowston-240208-20-1400x800.jpg"),
  },
]

export default function HomeScreen() {
  const { user, isLoading: isAuthLoading } = useAuth()

  const { data: businesses, isLoading: isBusinessesLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: getAllBusinesses,
  })

  const { data: appointments, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: getMyAppointments,
  })

  // Helper function to safely render address
  const renderAddress = (address: string | { street: string; city: string; postalCode: string }) => {
    if (typeof address === "string") {
      return address
    } else if (address && typeof address === "object") {
      return `${address.street}, ${address.city}, ${address.postalCode}`
    }
    return ""
  }

  if (isAuthLoading || isBusinessesLoading || isAppointmentsLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const navigateTo = (path: string) => {
    router.push(path as any)
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ✅ Sabit header */}
      <View style={styles.header}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>zivo</Text>
      </View>

      {/* 🔽 Scroll edilebilir içerik */}
      <ScrollView style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholderTextColor="#8888" placeholder="Search services or businesses" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => navigateTo(`/(tabs)/explore?category=${category.id}`)}
            >
              <Image source={category.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>VISITED AND FAVORITES</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favoritesContainer}>
          {businesses?.slice(0, 3).map((business) => (
            <TouchableOpacity
              key={business.id}
              style={styles.favoriteItem}
              onPress={() => navigateTo(`/${business.id}`)}
            >
              {business.profileImageUrl && (
                <Image source={{ uri: business.profileImageUrl }} style={styles.favoriteImage} resizeMode="cover" />
              )}
              <View style={styles.favoriteRating}>
                <Text style={styles.favoriteRatingText}>{business.rating?.toFixed(1) || '0.0'}</Text>
                <Text style={styles.favoriteReviewsText}>{business.reviews || 0} reviews</Text>
              </View>
              <Text style={styles.favoriteName}>{business.name}</Text>
              <Text style={styles.favoriteAddress}>{renderAddress(business.address)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MY APPOINTMENTS</Text>
        </View>

        <TouchableOpacity style={styles.appointmentsButton} onPress={() => navigateTo("/(tabs)/appointments")}>
          <Text style={styles.appointmentsButtonText}>
            {appointments?.length ? `You have ${appointments.length} appointments` : 'No appointments yet'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#2596be",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 11,
    alignItems: "center",
    backgroundColor: "#2596be",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: 10,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  favoritesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  favoriteItem: {
    width: 200,
    marginHorizontal: 5,
  },
  favoriteImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 5,
  },
  favoriteRating: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    padding: 5,
  },
  favoriteRatingText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  favoriteReviewsText: {
    color: "#fff",
    fontSize: 10,
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  favoriteAddress: {
    fontSize: 12,
    color: "#666",
  },
  appointmentsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 8,
  },
  appointmentsButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
})
