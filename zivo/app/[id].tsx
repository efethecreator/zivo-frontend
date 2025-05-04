// app/[id].tsx

"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBusinessById } from "../services/business.service";
import { getBusinessServices } from "../services/service.service";
import { getBusinessReviews } from "../services/review.service";
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from "../services/favorite.service";
import { getBusinessPortfolio } from "../services/portfolio.service";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("SERVICES");
  const [canReview, setCanReview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const [mapHtml, setMapHtml] = useState<string>("");
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessById(id as string),
  });

  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ["services", id],
    queryFn: () => getBusinessServices(id as string),
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getBusinessReviews(id as string),
  });

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => getBusinessPortfolio(id as string),
  });

  const { data: favorites, isLoading: isFavoritesLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  const [localFavoriteState, setLocalFavoriteState] = useState(false);

  // Open location in maps app
  const openInMaps = () => {
    if (!business) return;

    const { latitude, longitude, name, address } = business;
    const label = encodeURIComponent(name);
    const addr = encodeURIComponent(typeof address === "string" ? address : "");

    const scheme = Platform.select({ ios: "maps:", android: "geo:" });
    const latLng = `${latitude},${longitude}`;

    // Different URL formats for iOS and Android
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}&address=${addr}`,
      android: `${scheme}${latLng}?q=${latLng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}&query_place_id=${label}`,
    });

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error("Error opening maps app:", err);
        // Fallback to Google Maps web
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${latLng}`
        );
      });
    }
  };

  useEffect(() => {
    if (business) {
      console.log(
        "Creating business map with location:",
        business.latitude,
        business.longitude
      );

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Business Location</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <style>
              html, body, #map {
                height: 100%;
                margin: 0;
                padding: 0;
                background: white;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              }
        
              .leaflet-popup-content-wrapper {
                background: #ffffff;
                color: #333;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                padding: 10px;
              }
        
              .leaflet-popup-tip {
                background: #ffffff;
              }
              
              /* Prevent scrolling issues */
              .leaflet-container {
                touch-action: none;
              }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script>
              // Harita oluşturma işlemi
              var map = L.map('map', { 
                zoomControl: false,
                dragging: true,
                tap: true,
                scrollWheelZoom: true
              }).setView([${business.latitude}, ${business.longitude}], 15);
              
              // Scroll olaylarını engelle
              map.on('drag', function() {
                window.ReactNativeWebView.postMessage('MAP_DRAG_START');
              });
              
              map.on('dragend', function() {
                window.ReactNativeWebView.postMessage('MAP_DRAG_END');
              });
        
              // Beyaz ve modern harita zemini
              L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                maxZoom: 19
              }).addTo(map);
        
              // İşletme konumu için marker
              L.marker([${business.latitude}, ${business.longitude}], {
                icon: L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
                  iconSize: [32, 32],
                  iconAnchor: [16, 36],
                  popupAnchor: [0, -32]
                })
              })
              .addTo(map)
              .bindPopup('<strong>${business.name}</strong><br><small>${business.address}</small>')
              .openPopup();
            </script>
          </body>
        </html>
      `;

      console.log("Setting business map HTML...");
      setMapHtml(html);
    }
  }, [business]);

  useEffect(() => {
    if (favorites && id) {
      const isFav = favorites.some(
        (fav) => String(fav.businessId) === String(id)
      );
      setLocalFavoriteState(isFav);
      console.log("[Favorites] 🔄 State güncellendi:", isFav);
    }
  }, [favorites, id]);

  const favoriteMutation = useMutation({
    mutationFn: async (businessId: string) => {
      if (localFavoriteState) {
        const matchedFavorite = favorites?.find(
          (fav) => fav.business.id === businessId
        );

        if (!matchedFavorite) {
          throw new Error("Favori bulunamadı");
        }

        console.log("🗑️ Silinecek favorite ID:", matchedFavorite.id);
        return await removeFromFavorites(matchedFavorite.id);
      } else {
        return await addToFavorites(businessId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      setLocalFavoriteState(!localFavoriteState);
      console.log("[Favorites] ✅ Toggled local state:", !localFavoriteState);
    },
    onError: (error) => {
      console.error("[Favorites] ❌ Hata:", error);
    },
  });

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message === "MAP_DRAG_START") {
      setScrollEnabled(false);
    } else if (message === "MAP_DRAG_END") {
      setScrollEnabled(true);
    }
  };

  // Calculate average rating and review count
  const averageRating =
    reviews?.reduce((acc, review) => acc + review.rating, 0) /
    (reviews?.length || 1);
  const reviewCount = reviews?.length || 0;

  const handleBookService = (serviceId: number) => {
    router.push(`/booking/${serviceId}` as any);
  };

  const isLoading =
    isBusinessLoading ||
    isServicesLoading ||
    isLoadingReviews ||
    isLoadingPortfolio;

  if (isLoading || !business) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2596be" />
      </View>
    );
  }

  // Helper function to safely render address
  const renderAddress = () => {
    if (typeof business.address === "string") {
      return business.address;
    } else if (business.address && typeof business.address === "object") {
      return `${business.address.street}, ${business.address.city}, ${business.address.postalCode}`;
    }
    return "";
  };

  // Helper function to safely render price
  const renderPrice = (price: string | number) => {
    if (typeof price === "number") {
      return price.toFixed(2);
    }
    return price;
  };

  const renderMap = () => {
    if (Platform.OS === "web") {
      return (
        <View style={{ position: "relative", width: "100%", height: 200 }}>
          <iframe srcDoc={mapHtml} style={styles.map} allow="geolocation" />
          <TouchableOpacity
            style={styles.mapDirectionsButton}
            onPress={openInMaps}
          >
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.mapDirectionsText}></Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{ position: "relative", width: "100%", height: 200 }}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          onMessage={handleWebViewMessage}
          onError={(e) => console.error("WebView error:", e.nativeEvent)}
        />
        <TouchableOpacity
          style={styles.mapDirectionsButton}
          onPress={openInMaps}
        >
          <Ionicons name="navigate" size={20} color="#fff" />
          
        </TouchableOpacity>
      </View>
    );
  };

  const renderReviews = () => (
    <View style={styles.tabContent}>
      {isLoadingReviews ? (
        <ActivityIndicator size="large" color="#2596be" />
      ) : (
        <>
          {canReview && (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => router.push(`/create-review/${id}` as any)}
            >
              <Text style={styles.addReviewButtonText}>Add Review</Text>
            </TouchableOpacity>
          )}
          {reviews?.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUserInfo}>
                  <View style={styles.userIcon}>
                    <Ionicons
                      name="person-circle-outline"
                      size={40}
                      color="#2596be"
                    />
                  </View>
                  <View style={styles.reviewRatingContainer}>
                    {[...Array(5)].map((_, index) => (
                      <Ionicons
                        key={index}
                        name={index < review.rating ? "star" : "star-outline"}
                        size={16}
                        color="#2596be"
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );

  const renderPortfolio = () => (
    <View style={styles.tabContent}>
      {isLoadingPortfolio ? (
        <ActivityIndicator size="large" color="#2596be" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {portfolio?.map((item) => (
            <View key={item.id} style={styles.portfolioItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.portfolioImage}
                resizeMode="cover"
              />
              <Text style={styles.portfolioTitle}>{item.title}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fff" />

      {/* Header Image */}
      <View style={styles.imageWrapper}>
        {business.coverImageUrl ? (
          <Image
            source={{ uri: business.coverImageUrl }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.headerImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={50} color="#ccc" />
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Rating Badge */}
        <TouchableOpacity
          style={styles.ratingBadge}
          onPress={() => setActiveTab("REVIEWS")}
        >
          <Text style={styles.ratingText}>{averageRating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>{reviewCount} reviews</Text>
        </TouchableOpacity>
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
              onPress={() => favoriteMutation.mutate(id as string)}
              disabled={isFavoritesLoading}
            >
              <Ionicons
                name={localFavoriteState ? "heart" : "heart-outline"}
                size={24}
                color={localFavoriteState ? "#ff3b30" : "#666"}
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
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
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
                placeholderTextColor="#8888"
                placeholder="Search for service"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.servicesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Services</Text>
                <Ionicons name="chevron-up" size={24} color="#666" />
              </View>

              {services?.map((service) => (
                <View key={service.id} style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDuration}>
                      {service.durationMinutes} min
                    </Text>
                  </View>
                  <View style={styles.servicePriceContainer}>
                    <Text style={styles.servicePrice}>
                      € {renderPrice(service.price)}
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

        {activeTab === "REVIEWS" && renderReviews()}

        {activeTab === "PORTFOLIO" && renderPortfolio()}

        {activeTab === "DETAILS" && (
          <View style={styles.tabContent}>
            <View style={styles.detailsContainer}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>About</Text>
                <Text style={styles.detailDescription}>
                  {business.description}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>
                  Contact Information
                </Text>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>{business.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>{business.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View
                    style={{
                      height: 200,
                      borderRadius: 10,
                      overflow: "hidden",
                      marginTop: 10,
                      width: "100%",
                    }}
                  >
                    {!mapHtml ? (
                      <View
                        style={{
                          height: 200,
                          width: "100%",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        <ActivityIndicator size="large" color="#2596be" />
                        <Text style={{ marginTop: 10, color: "#666" }}>
                          Loading map...
                        </Text>
                      </View>
                    ) : (
                      renderMap()
                    )}
                  </View>
                </View>
              </View>
            </View>
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
  imageWrapper: {
    position: "relative",
    height: 300,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
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
  addReviewButton: {
    backgroundColor: "#2596be",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  addReviewButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  reviewUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userIcon: {
    marginRight: 15,
  },
  reviewRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewDate: {
    fontSize: 13,
    color: "#666",
    marginLeft: 10,
  },
  reviewComment: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  portfolioItem: {
    marginRight: 10,
  },
  portfolioImage: {
    width: 200,
    height: 200,
    borderRadius: 4,
    resizeMode: "cover",
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  detailsContainer: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 30,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  detailDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: "#666",
    marginLeft: 10,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
    border: "none",
    backgroundColor: "#f0f0f0",
  },
  mapDirectionsButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#2596be",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mapDirectionsText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 5,
  },
});
