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
import { SafeAreaView } from "react-native-safe-area-context";

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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Görsel + Floating Back + Rating */}
      <View style={{ position: "relative" }}>
        <Image
          source={business.images[0]}
          style={{
            width: "100%",
            height: 300,
            resizeMode: "cover",
          }}
        />
  
        {/* Back Button */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 50,
            left: 20,
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 10,
            borderRadius: 20,
            zIndex: 10,
          }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
  
        {/* Rating Badge */}
        <View
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            backgroundColor: "rgba(0,0,0,0.7)",
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {business.rating.toFixed(1)}
          </Text>
          <Text style={{ color: "#fff", fontSize: 10 }}>
            {business.reviews} reviews
          </Text>
        </View>
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
        {["SERVICES", "REVIEWS", "PORTFOLIO", "DETAILS"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
  
      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "SERVICES" && (
          <>
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
  
            <View style={styles.servicesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Services</Text>
                <Ionicons name="chevron-up" size={24} color="#666" />
              </View>
  
              {services.map((service) => (
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
  
              {services.map((service) => (
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
  );
  
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  imageWrapper: {
    position: "relative",
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
    height: 1,
  },
  businessImage: {
    width: "100%",
    height: 300,
    
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
    backgroundColor: "#fff",
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
