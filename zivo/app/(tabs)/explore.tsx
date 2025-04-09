"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { mockBusinesses } from "../../mocks/businesses"
import type { Business } from "../../types"

const categories = [
  { id: "all", name: "All" },
  { id: "barbers", name: "Barbers" },
  { id: "hair", name: "Hair salons" },
  { id: "spa", name: "Day SPA" },
  { id: "skin", name: "Skin care" },
  { id: "pet", name: "Pet services" },
]

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Convert mock data to match Business type
      const typedBusinesses: Business[] = mockBusinesses.map((business) => ({
        ...business,
        type: "salon", // Default value
        workingHours: {}, // Default empty object
        // Ensure address is properly handled
        address: business.address || "",
        // Ensure other required properties exist
        rating: business.rating || 0,
        reviews: business.reviews || 0,
        images: business.images || [],
      }))
      setBusinesses(typedBusinesses)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Helper function to safely render address
  const renderAddress = (address: string | { street: string; city: string; postalCode: string }) => {
    if (typeof address === "string") {
      return address
    } else if (address && typeof address === "object") {
      return `${address.street}, ${address.city}, ${address.postalCode}`
    }
    return ""
  }

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity style={styles.businessCard} onPress={() => router.push(`/${item.id?.toString()}` as any)}>
      {item.images?.[0] && <Image source={item.images[0]} style={styles.businessImage} resizeMode="cover" />}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{(item.rating || 0).toFixed(1)}</Text>
        <Text style={styles.reviewsText}>{item.reviews || 0} reviews</Text>
      </View>
      <Text style={styles.businessName}>{item.name}</Text>
      <Text style={styles.businessAddress}>{renderAddress(item.address)}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Explore</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for service or business name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationText}>Near You</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={20} color="#000" />
          <Text style={styles.dateText}>When?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryButton, selectedCategory === category.id && styles.selectedCategory]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === category.id && styles.selectedCategoryText]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.filterActionsContainer}>
        <TouchableOpacity style={styles.filtersButton}>
          <Ionicons name="options-outline" size={20} color="#000" />
          <Text style={styles.filtersText}>Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort by: Recommended</Text>
          <Ionicons name="chevron-down" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>Results ({businesses.length})</Text>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.infoText}>What affects the search results?</Text>
          <Ionicons name="information-circle-outline" size={16} color="#666" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading businesses...</Text>
        </View>
      ) : (
        <FlatList
          data={businesses}
          renderItem={renderBusinessItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.businessList}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 5,
    alignItems: "center",
    backgroundColor: "#fff",
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  locationButton: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 10,
  },
  locationText: {
    fontSize: 16,
  },
  dateButton: {
    flex: 1,
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 5,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 60, // Bunu ekle
    zIndex: 2, // Üstte kalmasını sağla
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  selectedCategory: {
    borderBottomWidth: 2,
    borderBottomColor: "#1B9AAA",
  },
  categoryText: {
    fontSize: 16,
    color: "#666",
  },
  selectedCategoryText: {
    color: "#000",
    fontWeight: "500",
  },
  filterActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginBottom: 15,
    zIndex: 1, // kategori barının altında kalmasını sağlar
  },

  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    marginRight: 10,
  },
  filtersText: {
    marginLeft: 5,
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  sortText: {
    fontSize: 14,
  },
  resultsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  businessList: {
    padding: 15,
  },
  businessCard: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  businessImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  ratingContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    padding: 5,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  reviewsText: {
    color: "#fff",
    fontSize: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
  },
  businessAddress: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
})
