"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { getBusinessById } from "../services/business.service"
import { getBusinessServices } from "../services/service.service"
import type { Business, Service } from "../types"
import { StatusBar } from "expo-status-bar"

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams()
  const [activeTab, setActiveTab] = useState("SERVICES")
  const [isFavorite, setIsFavorite] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: () => getBusinessById(id as string),
  })

  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ['services', id],
    queryFn: () => getBusinessServices(id as string),
  })

  const handleBookService = (serviceId: number) => {
    router.push(`/booking/${serviceId}` as any)
  }

  const isLoading = isBusinessLoading || isServicesLoading

  if (isLoading || !business) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2596be" />
      </View>
    )
  }

  // Helper function to safely render address
  const renderAddress = () => {
    if (typeof business.address === "string") {
      return business.address
    } else if (business.address && typeof business.address === "object") {
      return `${business.address.street}, ${business.address.city}, ${business.address.postalCode}`
    }
    return ""
  }

  // Helper function to safely render price
  const renderPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return price.toFixed(2)
    }
    return price
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fff" />
      
      {/* Header Image */}
      <View style={styles.imageWrapper}>
        {business.images?.[0] && (
          <Image
            source={{ uri: business.images[0] }}
            style={styles.headerImage}
          />
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{(business.rating || 0).toFixed(1)}</Text>
          <Text style={styles.reviewsText}>{business.reviews || 0} reviews</Text>
        </View>
      </View>

      {/* Business Info */}
      <View style={styles.businessInfo}>
        <View style={styles.businessNameContainer}>
          <Text style={styles.businessName}>{business.name}</Text>
          <View style={styles.businessActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#ff3b30" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.businessAddress}>{renderAddress()}</Text>
        <Text style={styles.businessType}>{business.type}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {["SERVICES", "REVIEWS", "PORTFOLIO", "DETAILS"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "SERVICES" && (
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput} 
                placeholderTextColor="#8888" 
                placeholder="Search for service"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.servicesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Services</Text>
                <Ionicons name="chevron-up" size={24} color="#666" />
              </View>

              {services?.map((service) => (
                <View key={service.id} style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  </View>
                  <View style={styles.servicePriceContainer}>
                    <Text style={styles.servicePrice}>€ {renderPrice(service.price)}</Text>
                    <TouchableOpacity 
                      style={styles.bookButton} 
                      onPress={() => handleBookService(service.id)}
                    >
                      <Text style={styles.bookButtonText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === "REVIEWS" && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Reviews coming soon</Text>
          </View>
        )}

        {activeTab === "PORTFOLIO" && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Portfolio coming soon</Text>
          </View>
        )}

        {activeTab === "DETAILS" && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Details coming soon</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  ratingBadge: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    zIndex: 10,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "bold",
  },
  reviewsText: {
    color: "#fff",
    fontSize: 10,
  },
  businessInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  businessNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  businessName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  businessActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  businessAddress: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  businessType: {
    fontSize: 14,
    color: "#2596be",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2596be",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#2596be",
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
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
  servicesContainer: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
  },
  servicePriceContainer: {
    alignItems: "flex-end",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: "#2596be",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  tabContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  comingSoonText: {
    fontSize: 16,
    color: "#666",
  },
})
