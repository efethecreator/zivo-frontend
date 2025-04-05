import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { mockBusinesses } from "../../mocks/businesses";
import { mockServices } from "../../mocks/services";
import { Business, Service } from "../../types";

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState("SERVICES");
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundBusiness = mockBusinesses.find((b) => b.id.toString() === id);
      if (foundBusiness) {
        setBusiness(foundBusiness);
      }

      const businessServices = mockServices.filter(
        (s) => s.businessId.toString() === id
      );
      setServices(businessServices);

      setIsLoading(false);
    }, 1000);
  }, [id]);

  const handleBookService = (serviceId: number) => {
    router.push(`/booking/${serviceId}` as any);
  };

  if (isLoading || !business) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading business details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Business Images */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
        >
          {business.images.map((image: string, index: number) => (
            <Image
              key={index}
              source={{ uri: image || "https://via.placeholder.com/400" }}
              style={styles.businessImage}
            />
          ))}
        </ScrollView>

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{business.rating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>{business.reviews} reviews</Text>
        </View>

        {/* Business Info */}
        <View style={styles.businessInfo}>
          <View style={styles.businessNameContainer}>
            <Text style={styles.businessName}>{business.name}</Text>
            <View style={styles.businessActions}>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.favoriteButton}
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

          <Text style={styles.businessAddress}>{business.address}</Text>
          <Text style={styles.businessType}>Entrepreneur</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "SERVICES" && styles.activeTab]}
            onPress={() => setActiveTab("SERVICES")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "SERVICES" && styles.activeTabText,
              ]}
            >
              SERVICES
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "REVIEWS" && styles.activeTab]}
            onPress={() => setActiveTab("REVIEWS")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "REVIEWS" && styles.activeTabText,
              ]}
            >
              REVIEWS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "PORTFOLIO" && styles.activeTab]}
            onPress={() => setActiveTab("PORTFOLIO")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "PORTFOLIO" && styles.activeTabText,
              ]}
            >
              PORTFOLIO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "DETAILS" && styles.activeTab]}
            onPress={() => setActiveTab("DETAILS")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "DETAILS" && styles.activeTabText,
              ]}
            >
              DETAILS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Services */}
        {activeTab === "SERVICES" && (
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for service"
            />
          </View>
        )}

        {/* Services List */}
        {activeTab === "SERVICES" && (
          <View style={styles.servicesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Services</Text>
              <Ionicons name="chevron-up" size={24} color="#666" />
            </View>

            {services.map((service: Service) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>
                    {service.duration}d
                  </Text>
                </View>
                <View style={styles.servicePriceContainer}>
                  <Text style={styles.servicePrice}>
                    € {service.price.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookService(service.id)}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Other Services</Text>
              <Ionicons name="chevron-up" size={24} color="#666" />
            </View>

            {services.map((service: Service) => (
              <View key={`other-${service.id}`} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>
                    {service.duration}d
                  </Text>
                </View>
                <View style={styles.servicePriceContainer}>
                  <Text style={styles.servicePrice}>
                    € {service.price.toFixed(2)}
                  </Text>
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
        )}

        {/* Reviews Tab Content */}
        {activeTab === "REVIEWS" && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Reviews coming soon</Text>
          </View>
        )}

        {/* Portfolio Tab Content */}
        {activeTab === "PORTFOLIO" && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Portfolio coming soon</Text>
          </View>
        )}

        {/* Details Tab Content */}
        {activeTab === "DETAILS" && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Details coming soon</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
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
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: 250,
  },
  businessImage: {
    width: 400,
    height: 250,
    resizeMode: "cover",
  },
  ratingBadge: {
    position: "absolute",
    top: 15,
    right: 15,
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
  businessInfo: {
    padding: 15,
  },
  businessNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  businessName: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  businessActions: {
    flexDirection: "row",
  },
  shareButton: {
    marginRight: 15,
  },
  favoriteButton: {},
  businessAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  businessType: {
    fontSize: 14,
    color: "#666",
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
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 12,
    color: "#666",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
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
    fontWeight: "bold",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    marginBottom: 5,
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
    fontWeight: "bold",
    marginBottom: 5,
  },
  bookButton: {
    backgroundColor: "#1B9AAA",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  tabContent: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  comingSoonText: {
    fontSize: 16,
    color: "#666",
  },
});
