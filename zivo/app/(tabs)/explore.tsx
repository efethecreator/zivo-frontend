"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { getAllBusinesses, getBusinessReviews, searchBusinesses, Business, SearchParams } from "../../services/business.service"
import type { Business as BusinessType } from "../../types"

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
  const [selectedType, setSelectedType] = useState<string>("")
  const [sortBy, setSortBy] = useState<SearchParams['sortBy']>("name")

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['businesses', searchQuery, selectedType, sortBy],
    queryFn: () => searchBusinesses({
      search: searchQuery,
      type: selectedType,
      sortBy
    }),
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => Promise.all(
      businesses?.map(business => getBusinessReviews(business.id)) || []
    ),
    enabled: !!businesses,
  })

  const getBusinessRating = (businessId: string) => {
    if (!reviews) return { rating: 0, count: 0 }
    
    const businessReviews = reviews.flat().filter(review => review.businessId === businessId)
    if (!businessReviews.length) return { rating: 0, count: 0 }
    
    const rating = businessReviews.reduce((acc, review) => acc + review.rating, 0) / businessReviews.length
    return { rating, count: businessReviews.length }
  }

  // Helper function to safely render address
  const renderAddress = (address: string | { street: string; city: string; postalCode: string }) => {
    if (typeof address === "string") {
      return address
    } else if (address && typeof address === "object") {
      return `${address.street}, ${address.city}, ${address.postalCode}`
    }
    return ""
  }

  const handleSearch = (text: string) => {
    setSearchQuery(text)
  }

  const handleTypeFilter = (typeId: string) => {
    setSelectedType(typeId === selectedType ? "" : typeId)
  }

  const handleSort = (sortOption: SearchParams['sortBy']) => {
    setSortBy(sortOption)
  }

  const renderBusinessItem = ({ item }: { item: Business }) => {
    const { rating, count } = getBusinessRating(item.id)
    return (
      <TouchableOpacity style={styles.businessCard} onPress={() => router.push(`/${item.id?.toString()}` as any)}>
        {item.profileImageUrl && <Image source={{ uri: item.profileImageUrl }} style={styles.businessImage} resizeMode="cover" />}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>{count} reviews</Text>
        </View>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessAddress}>{renderAddress(item.address)}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ color: "#fff", fontSize: 35, fontWeight: "bold" }}>Explore</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholderTextColor="#8888"
          placeholder="Search for service or business name"
          value={searchQuery}
          onChangeText={handleSearch}
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
        <TouchableOpacity
          style={[styles.categoryButton, selectedType === "" && styles.selectedCategory]}
          onPress={() => handleTypeFilter("")}
        >
          <Text style={[styles.categoryText, selectedType === "" && styles.selectedCategoryText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, selectedType === "c009a262-75b9-4c94-9137-e1195c897b64" && styles.selectedCategory]}
          onPress={() => handleTypeFilter("c009a262-75b9-4c94-9137-e1195c897b64")}
        >
          <Text style={[styles.categoryText, selectedType === "c009a262-75b9-4c94-9137-e1195c897b64" && styles.selectedCategoryText]}>Hair Salon</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.sortContainer}>
        <Text style={styles.sortTitle}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === "name" && styles.sortButtonActive]}
          onPress={() => handleSort("name")}
        >
          <Text style={[styles.sortText, sortBy === "name" && styles.sortTextActive]}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === "distance" && styles.sortButtonActive]}
          onPress={() => handleSort("distance")}
        >
          <Text style={[styles.sortText, sortBy === "distance" && styles.sortTextActive]}>Distance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === "rating" && styles.sortButtonActive]}
          onPress={() => handleSort("rating")}
        >
          <Text style={[styles.sortText, sortBy === "rating" && styles.sortTextActive]}>Rating</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>Results ({businesses?.length || 0})</Text>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.infoText}>What affects the search results?</Text>
          <Ionicons name="information-circle-outline" size={16} color="#666" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B9AAA" />
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
    height: 60,
    zIndex: 2,
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
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortTitle: {
    marginRight: 8,
    color: "#666",
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: "#1B9AAA",
  },
  sortText: {
    color: "#666",
  },
  sortTextActive: {
    color: "#fff",
  },
  resultsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: "500",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 10,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginHorizontal: 10,
  },
  businessAddress: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 10,
    marginBottom: 10,
  },
})
