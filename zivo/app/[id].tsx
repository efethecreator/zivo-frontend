// app/[id].tsx

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
  Dimensions,
  Animated,
  Modal,
  Pressable,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
// Removed duplicate import
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getBusinessById } from "../services/business.service"
import { getBusinessServices } from "../services/service.service"
import { getBusinessReviews } from "../services/review.service"
import { addToFavorites, removeFromFavorites, getFavorites } from "../services/favorite.service"
import { getBusinessPortfolio } from "../services/portfolio.service"
import { StatusBar } from "expo-status-bar"
import { WebView } from "react-native-webview"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "../context/AuthContext"
import { Ionicons } from "@expo/vector-icons"


const { width, height } = Dimensions.get("window")

// <-- buraya
const getContactIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case "instagram":
      return "logo-instagram"
    case "facebook":
      return "logo-facebook"
    case "twitter":
      return "logo-twitter"
    case "linkedin":
      return "logo-linkedin"
    case "whatsapp":
      return "logo-whatsapp"
    default:
      return "link-outline"
  }
}

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams()
  const [activeTab, setActiveTab] = useState("SERVICES")
  const [canReview, setCanReview] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()
  const [mapHtml, setMapHtml] = useState<string>("")
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const insets = useSafeAreaInsets()
  const [expandedReviews, setExpandedReviews] = useState<{
    [key: string]: boolean
  }>({})
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any>(null)

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.8, 1],
    extrapolate: "clamp",
  })

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: "clamp",
  })

  // useAuth'dan tokenAvailable'ı alalım
  const { tokenAvailable } = useAuth()

  // İşletme detayları için useQuery
  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessById(typeof id === "string" ? id : Array.isArray(id) ? id[0] : ""),
    enabled: !!id && !!tokenAvailable, // ID ve token varsa çalıştır
  })

  // Favoriler için useQuery
  const { data: favorites, isLoading: isFavoritesLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    enabled: !!tokenAvailable, // Token varsa çalıştır
  })

  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ["services", id],
    queryFn: () => getBusinessServices(id as string),
  })

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getBusinessReviews(id as string),
  })

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => getBusinessPortfolio(id as string),
  })

  const [localFavoriteState, setLocalFavoriteState] = useState(false)

  // Toggle review expansion
  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  // Open location in maps app
  const openInMaps = () => {
    if (!business) return

    const { latitude, longitude, name, address } = business
    const label = encodeURIComponent(name)
    const addr = encodeURIComponent(typeof address === "string" ? address : "")

    const scheme = Platform.select({ ios: "maps:", android: "geo:" })
    const latLng = `${latitude},${longitude}`

    // Different URL formats for iOS and Android
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}&address=${addr}`,
      android: `${scheme}${latLng}?q=${latLng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latLng}&query_place_id=${label}`,
    })

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error("Error opening maps app:", err)
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latLng}`)
      })
    }
  }

  useEffect(() => {
    if (business) {
      console.log("Creating business map with location:", business.latitude, business.longitude)

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
      `

      console.log("Setting business map HTML...")
      setMapHtml(html)
    }
  }, [business])

  useEffect(() => {
    if (favorites && id) {
      const isFav = favorites.some((fav) => String(fav.businessId) === String(id))
      setLocalFavoriteState(isFav)
      console.log("[Favorites] 🔄 State güncellendi:", isFav)
    }
  }, [favorites, id])

  const favoriteMutation = useMutation({
    mutationFn: async (businessId: string) => {
      if (localFavoriteState) {
        const matchedFavorite = favorites?.find((fav) => String(fav.businessId) === businessId)

        if (!matchedFavorite) {
          throw new Error("Favori bulunamadı")
        }

        console.log("🗑️ Silinecek favorite ID:", matchedFavorite.id)
        return await removeFromFavorites(matchedFavorite.id)
      } else {
        return await addToFavorites(businessId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
      setLocalFavoriteState(!localFavoriteState)
      console.log("[Favorites] ✅ Toggled local state:", !localFavoriteState)
    },
    onError: (error) => {
      console.error("[Favorites] ❌ Hata:", error)
    },
  })

  // Handle WebView messages
  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    const message = event.nativeEvent.data
    if (message === "MAP_DRAG_START") {
      setScrollEnabled(false)
    } else if (message === "MAP_DRAG_END") {
      setScrollEnabled(true)
    }
  }

  // Calculate average rating and review count
  const averageRating = reviews ? reviews.reduce((acc, review) => acc + review.rating, 0) / (reviews.length || 1) : 0
  const reviewCount = reviews?.length || 0

  // Calculate ratings breakdown
  const getRatingBreakdown = () => {
    if (!reviews || reviews.length === 0) return Array(5).fill(0)

    const breakdown = Array(5).fill(0)
    reviews.forEach((review) => {
      const rating = Math.floor(review.rating)
      if (rating >= 1 && rating <= 5) {
        breakdown[5 - rating]++
      }
    })
    return breakdown
  }

  const ratingBreakdown = getRatingBreakdown()

  const handleBookService = (serviceId: string | number) => {
    router.push(`/booking/${serviceId}` as any)
  }

  const openImageModal = (item: { imageUrl: string; description?: string; title?: string }) => {
    setSelectedImage(item.imageUrl)
    setSelectedPortfolioItem(item)
    setModalVisible(true)
  }

  const closeImageModal = () => {
    setModalVisible(false)
    setSelectedImage(null)
    setSelectedPortfolioItem(null)
  }

  const isLoading = isBusinessLoading || isServicesLoading || isLoadingReviews || isLoadingPortfolio

  if (isLoading || !business) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2596be" />
      </View>
    )
  }

  // Helper function to safely render address
  const renderAddress = () => {
    if (typeof business.address === "string") {
      return business.address
    } else if (business.address && typeof business.address === "object") {
      const addressObj = business.address as { street?: string; city?: string; postalCode?: string }
      return `${addressObj.street || ""}, ${addressObj.city || ""}, ${addressObj.postalCode || ""}`
    }
    return ""
  }

  // Helper function to safely render price
  const renderPrice = (price: string | number) => {
    if (typeof price === "number") {
      return price.toFixed(2)
    }
    return price
  }

  const renderMap = () => {
    if (Platform.OS === "web") {
      return (
        <View
          style={{
            position: "relative",
            width: "100%",
            height: 200,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <iframe srcDoc={mapHtml} style={styles.map} allow="geolocation" />
          <TouchableOpacity style={styles.mapDirectionsButton} onPress={openInMaps}>
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.mapDirectionsText}>Directions</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <View
        style={{
          position: "relative",
          width: "100%",
          height: 200,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          onMessage={handleWebViewMessage}
          onError={(e) => console.error("WebView error:", e.nativeEvent)}
        />
        <TouchableOpacity style={styles.mapDirectionsButton} onPress={openInMaps}>
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.mapDirectionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderReviews = () => (
    <View style={styles.tabContent}>
      {isLoadingReviews ? (
        <ActivityIndicator size="large" color="#2596be" />
      ) : reviews && reviews.length > 0 ? (
        <>
          {/* Rating Statistics Section */}
          <View style={styles.ratingStatsContainer}>
            <View style={styles.ratingStatsSummary}>
              <Text style={styles.ratingStatsScore}>
                {averageRating.toFixed(1)}
                <Text style={styles.ratingScaleText}>/5</Text>
              </Text>
              <View style={styles.ratingStarsRow}>
                {[...Array(5)].map((_, index) => (
                  <Ionicons key={index} name="star" size={22} color="#FFA500" />
                ))}
              </View>
              <Text style={styles.ratingStatsCount}>{reviewCount} reviews</Text>
            </View>

            <View style={styles.ratingStatsBreakdown}>
              {[5, 4, 3, 2, 1].map((star, index) => (
                <View key={star} style={styles.ratingStatsBreakdownRow}>
                  <Text style={styles.ratingStatsBreakdownLabel}>{star}</Text>
                  <View style={styles.ratingStatsBreakdownBar}>
                    <View
                      style={[
                        styles.ratingStatsBreakdownFill,
                        {
                          width: `${reviews.length > 0 ? (ratingBreakdown[index] / reviews.length) * 100 : 0}%`,
                          backgroundColor: star === 5 ? "#FFA500" : "#e0e0e0",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingStatsBreakdownCount}>{ratingBreakdown[index]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.reviewsHeaderContainer}>
            <Text style={styles.reviewsHeaderTitle}>Reviews</Text>
          </View>

          {canReview && (
            <TouchableOpacity style={styles.addReviewButton} onPress={() => router.push(`/create-review/${id}` as any)}>
              <Text style={styles.bookButtonText}>Write a Review</Text>
            </TouchableOpacity>
          )}

          {reviews?.map((review) => {
            // Kullanıcı adını doğru şekilde al
            const userName = review.appointment?.customer?.user?.fullName || "Anonymous"
            // Kullanıcı fotoğrafını kontrol et
            const userPhoto = review.appointment?.customer?.photoUrl
            // Yorum içeriğini belirli bir uzunlukta göster
            const isExpanded = expandedReviews[review.id] || false
            const reviewText = review.comment || ""

            // Service and staff info
            const serviceName = review.appointment?.appointmentServices?.[0]?.service?.name || "Unspecified service"
            const staffName = review.appointment?.customer?.user?.fullName || "Unspecified staff"

            return (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUserInfo}>
                    <View style={styles.userIcon}>
                      {userPhoto ? (
                        <Image source={{ uri: userPhoto }} style={styles.userProfilePhoto} resizeMode="cover" />
                      ) : (
                        <Ionicons name="person-circle-outline" size={40} color="#2596be" />
                      )}
                    </View>
                    <View>
                      <Text style={styles.reviewUserName}>{userName}</Text>
                      <View style={styles.reviewRatingContainer}>
                        {[...Array(5)].map((_, index) => (
                          <Ionicons
                            key={index}
                            name="star"
                            size={16}
                            color={index < review.rating ? "#FFA500" : "#e0e0e0"}
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.reviewComment}>{reviewText}</Text>

                {reviewText.length > 120 && (
                  <TouchableOpacity style={styles.showMoreButton} onPress={() => toggleReviewExpansion(review.id)}>
                    <Text style={styles.showMoreText}>{isExpanded ? "LESS DAYS" : "SHOW MORE"}</Text>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#666" />
                  </TouchableOpacity>
                )}

                {isExpanded && (
                  <>
                    <View style={styles.serviceInfoContainer}>
                      <View style={styles.serviceInfoRow}>
                        <Text style={styles.serviceInfoLabel}>Staff member:</Text>
                        <Text style={styles.serviceInfoValue}>{staffName}</Text>
                      </View>
                      <View style={styles.serviceInfoRow}>
                        <Text style={styles.serviceInfoLabel}>Service:</Text>
                        <Text style={styles.serviceInfoValue}>{serviceName}</Text>
                      </View>
                    </View>

                    <View style={styles.reviewHelpfulContainer}>
                      <Text style={styles.reviewHelpfulText}>Was this review helpful?</Text>
                      <View style={styles.reviewHelpfulButtons}>
                        <TouchableOpacity style={styles.reviewHelpfulButton}>
                          <Text style={styles.reviewHelpfulButtonText}>Yes (0)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.reviewHelpfulButton}>
                          <Text style={styles.reviewHelpfulButtonText}>No (0)</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )
          })}
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
          <Text style={styles.emptyStateText}>No reviews yet</Text>
        </View>
      )}
    </View>
  )

  const renderPortfolio = () => (
    <View style={styles.tabContent}>
      {isLoadingPortfolio ? (
        <ActivityIndicator size="large" color="#2596be" style={{ marginTop: 20 }} />
      ) : portfolio && portfolio.length > 0 ? (
        <View style={styles.portfolioContainer}>
          {/* Portfolio Öğeleri */}
          <View style={styles.portfolioItemsContainer}>
            {portfolio?.map((item, index) => (
              <Animated.View key={item.id} style={styles.portfolioItemWrapper}>
                <View style={styles.portfolioItem}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => openImageModal(item)}>
                    <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} resizeMode="cover" />
                  </TouchableOpacity>

                  <View style={styles.portfolioContent}>
                    <View style={styles.portfolioTitleContainer}>
                      <Text style={styles.portfolioTitle} numberOfLines={1}>
                        {item.description || "Başlık Yok"}
                      </Text>
                    </View>

                    {item.description && (
                      <Text style={styles.portfolioDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}

                    <View style={styles.portfolioFooter}>
                      <TouchableOpacity style={styles.portfolioMoreButton} onPress={() => openImageModal(item)}>
                        <Text style={styles.portfolioMoreButtonText}>Details</Text>
                        <Ionicons name="chevron-forward" size={14} color="#2596be" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="images-outline" size={60} color="#ccc" />
          <Text style={styles.emptyStateText}>There are no portfolio items yet.</Text>
        </View>
      )}

      {/* Image Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeImageModal}>
        <Pressable style={styles.modalOverlay} onPress={closeImageModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPortfolioItem?.title || "Details"}</Text>
              <TouchableOpacity onPress={closeImageModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />}

            {selectedPortfolioItem?.description && (
              <View style={styles.modalDescriptionContainer}>
                <Text style={styles.modalDescription}>{selectedPortfolioItem.description}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            backgroundColor: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ["rgba(0,0,0,0)", "rgba(255,255,255,0.95)"],
            }),
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={(scrollY as any)._value > 100 ? "#000" : "#fff"} />
        </TouchableOpacity>

        <Animated.Text
          style={[
            styles.headerTitle,
            {
              opacity: headerTitleOpacity,
              color: "#000",
            },
          ]}
          numberOfLines={1}
        >
          {business.name}
        </Animated.Text>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Header Image */}
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          {business.coverImageUrl ? (
            <Image source={{ uri: business.coverImageUrl }} style={styles.headerImage} resizeMode="cover" />
          ) : (
            <View style={[styles.headerImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
            </View>
          )}

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingScore}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewsCount}>{reviewCount} reviews</Text>
          </View>
        </Animated.View>

        {/* Business Info */}
        <View style={styles.businessInfo}>
          <View style={styles.businessNameContainer}>
            <Text style={styles.businessName}>{business.name}</Text>
            <View style={styles.businessActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={22} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => favoriteMutation.mutate(id as string)}
                disabled={isFavoritesLoading}
              >
                <Ionicons
                  name={localFavoriteState ? "heart" : "heart-outline"}
                  size={22}
                  color={localFavoriteState ? "#ff3b30" : "#666"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.businessTypeContainer}>
            <Text style={styles.businessType}>{business.type}</Text>
            <View style={styles.dot} />
            <Ionicons name="location-outline" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.businessAddress} numberOfLines={1}>
              {renderAddress()}
            </Text>
          </View>
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

        {/* Tab Content */}
        {activeTab === "SERVICES" && (
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholderTextColor="#999"
                placeholder="Search for service"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.servicesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Services</Text>
              </View>

              {isServicesLoading ? (
                <ActivityIndicator size="large" color="#2596be" style={{ marginTop: 20 }} />
              ) : services && services.length > 0 ? (
                services.map((service) => (
                  <View key={service.id} style={styles.serviceItem}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDuration}>{service.durationMinutes} min</Text>
                    </View>
                    <View style={styles.servicePriceContainer}>
                      <Text style={styles.servicePrice}>
                        €{" "}
                        {renderPrice(
                          typeof service.price === "string" ? service.price : Number(service.price).toString(),
                        )}
                      </Text>
                      <TouchableOpacity style={styles.bookButton} onPress={() => handleBookService(service.id)}>
                        <Text style={styles.bookButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="calendar-outline" size={60} color="#ccc" />
                  <Text style={styles.emptyStateText}>No services available</Text>
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === "REVIEWS" && renderReviews()}

        {activeTab === "PORTFOLIO" && renderPortfolio()}

        {activeTab === "DETAILS" && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>About</Text>
              <Text style={styles.detailDescription}>{business.description || "No description available."}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Contact Information</Text>

              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color="#2596be" />
                <Text style={styles.detailText}>
                  {business.address || "-"} | {business.city || "-"}, {business.district || "-"},{" "}
                  {business.postalCode || "-"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={20} color="#2596be" />
                <Text style={styles.detailText}>{business.phone || "No phone number available"}</Text>
              </View>

              {business.website && (
                <View style={styles.detailRow}>
                  <Ionicons name="globe-outline" size={20} color="#2596be" />
                  <Text style={styles.detailText} onPress={() => Linking.openURL(business.website)}>
                    {business.website}
                  </Text>
                </View>
              )}

              {business.contacts?.map((contact: { id: string; contactName: string; contactValue: string }) => (
                <View key={contact.id} style={styles.detailRow}>
                  <Ionicons name={getContactIcon(contact.contactName)} size={20} color="#2596be" />
                  <Text style={styles.detailText} onPress={() => Linking.openURL(contact.contactValue)}>
                    {contact.contactName}: {contact.contactValue}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Working Hours</Text>
              {business.shifts && business.shifts.length > 0 ? (
                business.shifts
                  .filter((shift: { isActive: boolean }) => shift.isActive)
                  .map(
                    (shift: {
                      id: string
                      dayOfWeek: number
                      isActive: boolean
                      shiftTime?: {
                        startTime: string
                        endTime: string
                      }
                    }) => {
                      const shiftTime = shift.shiftTime
                      if (!shiftTime) return null

                      const startTimeString = shiftTime.startTime.slice(11, 16) // "HH:mm"
                      const endTimeString = shiftTime.endTime.slice(11, 16) // "HH:mm"

                      const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
                        shift.dayOfWeek
                      ]

                      return {
                        id: shift.id,
                        dayOfWeek: shift.dayOfWeek,
                        display: (
                          <View key={shift.id} style={styles.detailRow}>
                            <Ionicons name="time-outline" size={20} color="#2596be" />
                            <Text style={styles.detailText}>
                              {dayName}: {startTimeString} - {endTimeString}
                            </Text>
                          </View>
                        ),
                      }
                    },
                  )
                  .filter(Boolean)
                  .sort((a, b) => {
                    // a and b can be null, but filter(Boolean) above ensures they are not
                    // However, for type safety, we can assert their types
                    return (a!.dayOfWeek - b!.dayOfWeek)
                  }) // 🔥 Günleri sıralıyoruz
                  .map((item) => item && item.display)
              ) : (
                <Text style={styles.detailText}>No working hours defined</Text>
              )}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Location</Text>
              <View style={styles.mapContainer}>
                {!mapHtml ? (
                  <View style={styles.mapPlaceholder}>
                    <ActivityIndicator size="large" color="#2596be" />
                    <Text style={{ marginTop: 10, color: "#666" }}>Loading map...</Text>
                  </View>
                ) : (
                  renderMap()
                )}
              </View>
            </View>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Arka plan rengini değiştirdim
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 100,
    paddingTop: 0, // Safe area insets zaten eklenecek
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    fontFamily: "Outfit-Bold",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  imageWrapper: {
    height: 300,
    position: "relative",
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
  ratingBadge: {
    position: "absolute",
    top: 53,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    minWidth: 65,
  },
  ratingScore: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
    fontFamily: "Outfit-Bold",
  },
  reviewsCount: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
    fontFamily: "Outfit-Regular",
  },
  businessInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
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
    flex: 1,
    fontFamily: "Outfit-Bold",
  },
  businessActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  businessTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  businessType: {
    fontSize: 14,
    color: "#2596be",
    fontWeight: "500",
    fontFamily: "Outfit-Regular",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
    marginHorizontal: 8,
  },
  businessAddress: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    fontFamily: "Outfit-light",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
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
    fontFamily: "Outfit-Regular",
  },
  activeTabText: {
    color: "#2596be",
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    fontFamily: "Outfit-regular",
  },
  servicesContainer: {
    padding: 15,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Outfit-Bold",
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
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
    fontFamily: "Outfit-Regular",
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Outfit-Light",
  },
  servicePriceContainer: {
    alignItems: "flex-end",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
    fontFamily: "Outfit-Bold",
  },
  bookButton: {
    backgroundColor: "#2596be",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  tabContent: {
    padding: 15,
  },
  // Rating statistics styles
  ratingStatsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingStatsSummary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  ratingStatsScore: {
    fontSize: 42,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    fontFamily: "Outfit-Bold",
  },
  ratingScaleText: {
    fontSize: 18,
    fontWeight: "400",
    color: "#666",
    fontFamily: "Outfit-Bold",
  },
  ratingStarsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  ratingStatsCount: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
  ratingStatsBreakdown: {
    flex: 1.3,
    paddingLeft: 15,
    justifyContent: "space-between",
  },
  ratingStatsBreakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  ratingStatsBreakdownLabel: {
    width: 15,
    fontSize: 14,
    color: "#666",
    marginRight: 10,
    fontFamily: "Outfit-Regular",
  },
  ratingStatsBreakdownBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginRight: 10,
    overflow: "hidden",
  },
  ratingStatsBreakdownFill: {
    height: "100%",
    borderRadius: 3,
  },
  ratingStatsBreakdownCount: {
    width: 20,
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    fontFamily: "Outfit-Regular",
  },
  reviewsHeaderContainer: {
    marginBottom: 20,
  },
  reviewsHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "Outfit-Bold",
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userIcon: {
    marginRight: 12,
  },
  userProfilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    fontFamily: "Outfit-Bold",
  },
  reviewRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Outfit-light",
  },
  verifiedBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2596be",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  reviewComment: {
    fontSize: 18,
    color: "#333",
    lineHeight: 25,
    fontFamily: "Outfit-Regular",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 5,
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    marginRight: 4,
  },
  serviceInfoContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  serviceInfoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  serviceInfoLabel: {
    fontSize: 14,
    color: "#666",
    width: 100,
    fontFamily: "Outfit-Bold",
  },
  serviceInfoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  reviewHelpfulContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  reviewHelpfulText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  reviewHelpfulButtons: {
    flexDirection: "row",
  },
  reviewHelpfulButton: {
    marginRight: 16,
  },
  reviewHelpfulButtonText: {
    fontSize: 14,
    color: "#2596be",
  },
  addReviewButton: {
    backgroundColor: "#2596be",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 20,
  },
  portfolioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  portfolioOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
  },

  detailsContainer: {
    padding: 20,
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    fontFamily: "Outfit-Bold",
  },
  detailDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    fontFamily: "Outfit-Light",
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
    flex: 1,
    fontFamily: "Outfit-Light",
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderWidth: 0,
    backgroundColor: "#f0f0f0",
  },
  mapPlaceholder: {
    height: 200,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
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
    fontFamily: "Outfit-Bold",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
    marginBottom: 20,
    fontFamily: "Outfit-Regular",
  },
  portfolioContainer: {
    flex: 1,
  },
  categoriesScrollView: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  categoryChipActive: {
    backgroundColor: "#2596be",
    borderColor: "#2596be",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  portfolioItemsContainer: {
    paddingHorizontal: 15,
  },
  portfolioItemWrapper: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  portfolioItem: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  portfolioImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  portfolioContent: {
    padding: 16,
  },
  portfolioTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  portfolioTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    fontFamily: "Outfit-Bold",
  },
  portfolioDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  portfolioDate: {
    fontSize: 15,
    color: "#999",
    marginLeft: 4,
  },
  portfolioDescription: {
    fontSize: 18,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: "Outfit-Light",
  },
  portfolioFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portfolioTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
  },
  portfolioTagText: {
    fontSize: 12,
    color: "#2596be",
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  portfolioMoreButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  portfolioMoreButtonText: {
    fontSize: 14,
    color: "#2596be",
    fontWeight: "500",
    marginRight: 4,
    fontFamily: "Outfit-Bold",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Outfit-Bold",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalImage: {
    width: "100%",
    height: 400,
    backgroundColor: "#000",
  },
  modalDescriptionContainer: {
    padding: 16,
    backgroundColor: "#000",
  },
  modalDescription: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
    fontFamily: "Outfit-Regular",
  },
})
