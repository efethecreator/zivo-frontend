"use client";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getAllBusinesses } from "../../services/business.service";
import { getAppointments } from "../../services/appointment.service";
import { getFavorites } from "../../services/favorite.service";
import Loading from "../../components/Loading";
import {
  getReviewsForBusiness,
  calculateBusinessRating,
} from "../../services/review.service";
import type { Business } from "../../types";
import { useState, useMemo, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import React from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalize, fontSizes, spacing } from "../../utils/responsive";
import type { Category } from "../../types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const SPACING = normalize(10);

const categories: Category[] = [
  {
    id: "hairsalon",
    name: "Hair Salon",
    icon: "https://zivo-project.s3.eu-central-1.amazonaws.com/uploads/hairsalon.jpg",
    businessTypeId: "17e8c196-d4b9-4949-806d-d093900a749f",
  },
  {
    id: "spawellness",
    name: "Spa & Wellness",
    icon: "https://zivo-project.s3.eu-central-1.amazonaws.com/uploads/spawelness.jpg",
    businessTypeId: "ab25e866-1922-45ef-8caa-fc0116175a3c",
  },
  {
    id: "skincare",
    name: "Skin Care",
    icon: "https://zivo-project.s3.eu-central-1.amazonaws.com/uploads/skincare.jpg",
    businessTypeId: "9acf7844-ff2e-4453-a6ce-9e0cfea4d583",
  },
  {
    id: "beautysalon",
    name: "Beauty Salon",
    icon: "https://zivo-project.s3.eu-central-1.amazonaws.com/uploads/beautysalon.jpg",
    businessTypeId: "46afc6d0-95ed-4b92-8047-3daed9f7472e",
  },
  {
    id: "tattoo",
    name: "Tattoo Studio",
    icon: "https://zivo-project.s3.eu-central-1.amazonaws.com/uploads/tattoo.jpeg",
    businessTypeId: "cd3048d1-1aa4-456d-b1b8-b497b9efd761",
  },
  {
    id: "nail",
    name: "Nail Studio",
    icon: "https://zivo-project.s3.eu-central-1.amazonaws.com/uploads/nailstudio.jpg",
    businessTypeId: "9a0432c8-098f-4339-a743-6bbf7ec07db3",
  },
];

// sortAppointmentsByDate fonksiyonunu API'nin gerçek veri yapısına göre düzeltelim
const sortAppointmentsByDate = (appointments: any[]) => {
  if (!Array.isArray(appointments)) return [];

  return [...appointments].sort((a, b) => {
    const dateA = new Date(a.appointmentTime);
    const dateB = new Date(b.appointmentTime);
    return dateA.getTime() - dateB.getTime();
  });
};

export default function HomeScreen() {
  // useAuth'dan tokenAvailable'ı alalım
  const { user, isLoading: isAuthLoading, tokenAvailable } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [favoriteReviews, setFavoriteReviews] = useState<
    Record<string, { rating: number; count: number }>
  >({});
  const [scrollY, setScrollY] = useState(0);
  const headerOpacity = useSharedValue(1);
  const searchBarTranslateY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setSelectedType(null);
    setSearchQuery("");
    setShowSearchResults(false);
  }, []);

  // Sayfa focus olduğunda (örn. tab'dan dönünce)
  useFocusEffect(
    React.useCallback(() => {
      setSelectedType(null);
      setSearchQuery("");
      setShowSearchResults(false);

      // Animasyonları sıfırla
      headerOpacity.value = withTiming(1, { duration: 300 });
      searchBarTranslateY.value = withTiming(0, { duration: 300 });
    }, [])
  );

  // Favorites için useQuery
  const { data: favoriteList = [], isLoading: isFavoritesLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    enabled: !!tokenAvailable, // Token varsa çalıştır
  });

  // Businesses için useQuery
  const { data: businesses, isLoading: isBusinessesLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: getAllBusinesses,
    enabled: !!tokenAvailable, // Token varsa çalıştır
  });

  // Appointments için useQuery
  const { data: appointmentResult, isLoading: isAppointmentsLoading } =
    useQuery({
      queryKey: ["appointments"],
      queryFn: getAppointments,
      enabled: !!tokenAvailable, // Token varsa çalıştır
    });

  const appointments = appointmentResult?.data || [];

  // Fetch reviews for favorite businesses
  useEffect(() => {
    if (favoriteList && favoriteList.length > 0) {
      const fetchReviewsForFavorites = async () => {
        const reviewsData: Record<string, { rating: number; count: number }> =
          {};

        for (const fav of favoriteList) {
          if (fav.businessId) {
            try {
              const reviews = await getReviewsForBusiness(
                fav.businessId.toString()
              );
              const { rating, count } = calculateBusinessRating(
                reviews,
                fav.businessId.toString()
              );
              reviewsData[fav.businessId.toString()] = { rating, count };
            } catch (error) {
              console.error(
                `Error fetching reviews for business ${fav.businessId}:`,
                error
              );
              reviewsData[fav.businessId.toString()] = { rating: 0, count: 0 };
            }
          }
        }

        setFavoriteReviews(reviewsData);
      };

      fetchReviewsForFavorites();
    }
  }, [favoriteList]);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];

    return businesses
      .map((business) => ({
        ...business,
        type: business.type || "default", // Ensure 'type' is present
      }))
      .filter((business) => {
        const matchesSearch = business.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesType =
          !selectedType || business.businessTypeId === selectedType;
        return matchesSearch && matchesType;
      });
  }, [businesses, searchQuery, selectedType]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setShowSearchResults(text.length > 0);
  };

  const handleCategoryPress = (category: (typeof categories)[0]) => {
    // If the same category is clicked again, toggle it off
    if (selectedType === category.businessTypeId) {
      setSelectedType(null);
      setShowSearchResults(false);
    } else {
      // Otherwise, select the new category and show search results
      setSelectedType(category.businessTypeId);
      setShowSearchResults(true);
    }
  };

  const handleSearchBarPress = () => {
    router.push("/(tabs)/explore");
  };

  // Helper function to safely render address
  const renderAddress = (
    address: string | { street: string; city: string; postalCode: string }
  ) => {
    if (typeof address === "string") {
      return address;
    } else if (address && typeof address === "object") {
      return `${address.street}, ${address.city}, ${address.postalCode}`;
    }
    return "";
  };

  // Get business rating from reviews
  const getBusinessRating = (businessId: string) => {
    return favoriteReviews[businessId] || { rating: 0, count: 0 };
  };

  // Animasyon stilleri
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: searchBarTranslateY.value }],
    };
  });

  const upcomingAppointments = sortAppointmentsByDate(appointments).filter(
    (appointment) => new Date(appointment.appointmentTime) >= new Date()
  );

  // Scroll olayını dinle
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    setScrollY(currentScrollY);

    if (currentScrollY > 50) {
      headerOpacity.value = withTiming(0.95, { duration: 200 });
      searchBarTranslateY.value = withTiming(-10, { duration: 200 });
    } else {
      headerOpacity.value = withTiming(1, { duration: 200 });
      searchBarTranslateY.value = withTiming(0, { duration: 200 });
    }
  };

  if (isAuthLoading || isBusinessesLoading || isAppointmentsLoading || !user) {
    return <Loading message="Loading..." />;
  }

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => navigateTo(`/${item.id}`)}
    >
      <Image
        source={{ uri: item.coverImageUrl || "https://placehold.co/400" }}
        style={styles.businessImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.businessImageOverlay}
      />
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessAddress}>
          {renderAddress(item.address)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#2596be" />
      <SafeAreaView style={styles.safeContainer}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            headerAnimatedStyle,
            {
              paddingTop: insets.top,
              marginTop: normalize(10), // Add this line to move header down
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.logoText}>ZIVO</Text>
            {user && (
              <Text style={styles.welcomeText}>
                Welcome back, {user.fullName || "Guest"}
              </Text>
            )}
          </View>
        </Animated.View>

        {showSearchResults ? (
          // When search results should be shown, render just the FlatList
          <View style={styles.container}>
            {/* Arama Çubuğu */}
            <Animated.View
              style={[styles.searchContainerWrapper, searchBarAnimatedStyle]}
              entering={FadeInDown.delay(100).duration(500)}
            >
              <TouchableOpacity
                style={styles.searchContainer}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/explore",
                    params: { focusSearch: "true" },
                  });
                }}
              >
                <Ionicons
                  name="search"
                  size={normalize(20)}
                  color="#666"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search businesses..."
                  placeholderTextColor="#6666"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Kategoriler */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Text style={styles.sectionLabel}>CATEGORIES</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
              >
                {categories.map((category, index) => (
                  <Animated.View
                    key={category.id}
                    entering={FadeInDown.delay(200 + index * 50).duration(400)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryItem,
                        selectedType === category.businessTypeId &&
                          styles.categoryItemActive,
                      ]}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <View style={styles.categoryIconContainer}>
                        <Image
                          source={{ uri: category.icon as string }}
                          style={styles.categoryIcon}
                        />
                        {selectedType === category.businessTypeId && (
                          <View style={styles.categorySelectedOverlay} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.categoryName,
                          selectedType === category.businessTypeId &&
                            styles.categoryNameActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>

            <FlatList
              data={filteredBusinesses}
              renderItem={renderBusinessItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.businessList}
              style={{ flex: 1 }}
              contentInsetAdjustmentBehavior="automatic"
            />
          </View>
        ) : (
          // When showing regular content, use the ScrollView
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + normalize(60) },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentInsetAdjustmentBehavior="automatic"
          >
            {/* Arama Çubuğu */}
            <Animated.View
              style={[styles.searchContainerWrapper, searchBarAnimatedStyle]}
              entering={FadeInDown.delay(100).duration(500)}
            >
              <TouchableOpacity
                style={styles.searchContainer}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/explore",
                    params: { focusSearch: "true" },
                  });
                }}
              >
                <Ionicons
                  name="search"
                  size={normalize(20)}
                  color="#666"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search businesses..."
                  placeholderTextColor="#6666"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Kategoriler */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Text style={styles.sectionLabel}>CATEGORIES</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
              >
                {categories.map((category, index) => (
                  <Animated.View
                    key={category.id}
                    entering={FadeInDown.delay(200 + index * 50).duration(400)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryItem,
                        selectedType === category.businessTypeId &&
                          styles.categoryItemActive,
                      ]}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <View style={styles.categoryIconContainer}>
                        <Image
                          source={{ uri: category.icon }}
                          style={styles.categoryIcon}
                        />
                        {selectedType === category.businessTypeId && (
                          <View style={styles.categorySelectedOverlay} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.categoryName,
                          selectedType === category.businessTypeId &&
                            styles.categoryNameActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Favoriler Bölümü */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>FAVORITES</Text>
                {favoriteList.length > 0 && (
                  <TouchableOpacity>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isFavoritesLoading ? (
                <View style={styles.loadingContainer}>
                  <Loading message="Loading favorites..." />
                </View>
              ) : favoriteList.length > 0 ? (
                <View style={{ height: normalize(220) }}>
                  <FlatList
                    data={favoriteList}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.favoritesContainer}
                    contentContainerStyle={styles.favoritesContent}
                    snapToInterval={CARD_WIDTH + SPACING}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    bounces={favoriteList.length > 1}
                    scrollEnabled={favoriteList.length > 1}
                    keyExtractor={(item) => item.businessId.toString()}
                    renderItem={({ item: fav, index }) => {
                      const { rating, count } = getBusinessRating(
                        fav.businessId
                      );
                      const isSingleFavorite = favoriteList.length === 1;

                      return (
                        <Animated.View
                          entering={FadeInDown.delay(
                            300 + index * 100
                          ).duration(500)}
                          style={[
                            styles.favoriteItemContainer,
                            isSingleFavorite && {
                              marginLeft:
                                (width - CARD_WIDTH) / 2 - SPACING / 2,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.favoriteItem}
                            onPress={() => navigateTo(`/${fav.businessId}`)}
                            activeOpacity={0.9}
                          >
                            {businesses?.find((b) => b.id === fav.businessId)
                              ?.coverImageUrl && (
                              <Image
                                source={{
                                  uri: businesses.find(
                                    (b) => b.id === fav.businessId
                                  )?.coverImageUrl,
                                }}
                                style={styles.favoriteImage}
                                resizeMode="cover"
                              />
                            )}
                            <LinearGradient
                              colors={["transparent", "rgba(0,0,0,0.7)"]}
                              style={styles.favoriteImageOverlay}
                            />
                            <View style={styles.favoriteContent}>
                              <View style={styles.favoriteRating}>
                                <Ionicons
                                  name="star"
                                  size={normalize(16)}
                                  color="#FFD700"
                                />
                                <Text style={styles.favoriteRatingText}>
                                  {rating.toFixed(1)}
                                </Text>
                                <Text style={styles.favoriteReviewsText}>
                                  ({count})
                                </Text>
                              </View>
                              <Text style={styles.favoriteName}>
                                {businesses?.find(
                                  (b) => b.id === fav.businessId
                                )?.name || "Unknown Business"}
                              </Text>
                              <Text style={styles.favoriteAddress}>
                                {renderAddress(
                                  businesses?.find(
                                    (b) => b.id === fav.businessId
                                  )?.address || ""
                                )}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    }}
                  />
                </View>
              ) : (
                <Animated.View
                  style={styles.emptyFavoritesContainer}
                  entering={FadeInDown.delay(400).duration(500)}
                >
                  <Ionicons
                    name="heart-outline"
                    size={normalize(48)}
                    color="#ccc"
                    style={styles.emptyIcon}
                  />
                  <Text style={styles.noFavoritesText}>No favorites yet</Text>
                  <Text style={styles.noFavoritesSubtext}>
                    Add businesses to your favorites for quick access
                  </Text>
                  <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => navigateTo("/(tabs)/explore")}
                  >
                    <Ionicons
                      name="search-outline"
                      size={normalize(18)}
                      color="#fff"
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text style={styles.exploreButtonText}>EXPLORE</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>

            {/* Yaklaşan Randevular Bölümü */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>UPCOMING APPOINTMENTS</Text>
                {upcomingAppointments.length > 0 && (
                  <TouchableOpacity
                    onPress={() => navigateTo("/(tabs)/appointments")}
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isAppointmentsLoading ? (
                <View style={styles.loadingContainer}>
                  <Loading message="Loading appointments..." />
                </View>
              ) : upcomingAppointments.length > 0 ? (
                <View style={styles.upcomingAppointments}>
                  {upcomingAppointments
                    .slice(0, 3)
                    .map((appointment, index) => {
                      const appointmentDate = new Date(
                        appointment.appointmentTime
                      );
                      const today = new Date();
                      const tomorrow = new Date();
                      tomorrow.setDate(today.getDate() + 1);

                      let dateText = appointmentDate.toLocaleDateString();
                      if (
                        appointmentDate.toDateString() === today.toDateString()
                      ) {
                        dateText = "Today";
                      } else if (
                        appointmentDate.toDateString() ===
                        tomorrow.toDateString()
                      ) {
                        dateText = "Tomorrow";
                      }
                      const timeText = appointment.appointmentTime
                        ? appointment.appointmentTime.slice(11, 16) // HH:MM
                        : "--:--";

                      const businessName =
                        appointment.business?.name || "Appointment";
                      const serviceNames =
                        appointment.appointmentServices
                          ?.map(
                            (s: { service?: { name?: string } }) =>
                              s.service?.name || "Service"
                          )
                          .join(", ") || "Service";

                      return (
                        <Animated.View
                          key={appointment.id}
                          entering={FadeInDown.delay(
                            400 + index * 100
                          ).duration(500)}
                        >
                          <TouchableOpacity
                            style={styles.appointmentItem}
                            onPress={() => navigateTo(`/appointments`)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.appointmentDateContainer}>
                              <Text style={styles.appointmentDay}>
                                {dateText}
                              </Text>
                              <Text style={styles.appointmentTime}>
                                {timeText}
                              </Text>
                            </View>
                            <View style={styles.appointmentDetails}>
                              <Text
                                style={styles.appointmentBusinessName}
                                numberOfLines={1}
                              >
                                {businessName}
                              </Text>
                              <Text
                                style={styles.appointmentServiceName}
                                numberOfLines={1}
                              >
                                {serviceNames}
                              </Text>
                            </View>
                            <View style={styles.appointmentStatus}>
                              <Text
                                style={[
                                  styles.statusText,
                                  {
                                    backgroundColor:
                                      appointment.status === "confirmed"
                                        ? "rgba(76, 175, 80, 0.1)"
                                        : appointment.status === "pending"
                                        ? "rgba(255, 152, 0, 0.1)"
                                        : appointment.status === "cancelled"
                                        ? "rgba(244, 67, 54, 0.1)"
                                        : "rgba(37, 150, 190, 0.1)",
                                    color:
                                      appointment.status === "confirmed"
                                        ? "#4CAF50"
                                        : appointment.status === "pending"
                                        ? "#FF9800"
                                        : appointment.status === "cancelled"
                                        ? "#F44336"
                                        : "#2596be",
                                  },
                                ]}
                              >
                                {appointment.status?.charAt(0).toUpperCase() +
                                  appointment.status?.slice(1) || "Pending"}
                              </Text>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={normalize(20)}
                              color="#999"
                            />
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    })}
                </View>
              ) : (
                <Animated.View
                  style={styles.noAppointments}
                  entering={FadeInDown.delay(500).duration(500)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={normalize(48)}
                    color="#2596be"
                    style={styles.emptyIcon}
                  />
                  <Text style={styles.noAppointmentsText}>
                    You have no upcoming appointments
                  </Text>
                  <Text style={styles.noAppointmentsSubtext}>
                    Book a service now and never miss out!
                  </Text>
                </Animated.View>
              )}
            </Animated.View>

            {/* Ekstra boşluk */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#2596be",
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "#2596be",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    marginTop: normalize(10), // Header ile arama çubuğu arasındaki boşluğu azalttık
  },
  scrollContent: {
    paddingTop: spacing.m, // İçeriğin üst kısmında biraz boşluk bırakıyoruz
  },
  contentContainer: {
    paddingBottom: spacing.l,
  },
  loadingContainer: {
    padding: spacing.l,
    alignItems: "center",
  },
  header: {
    width: "100%",
    paddingHorizontal: spacing.l,
    paddingTop: Platform.OS === "ios" ? normalize(25) : normalize(20), // Increased from 10 to 25/20
    paddingBottom: spacing.m,
  },
  headerContent: {
    alignItems: "center", // Logo ve welcome text'i ortaladık
    justifyContent: "center",
  },
  logoText: {
    fontSize: fontSizes.header,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Outfit-Bold",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: fontSizes.l,
    fontFamily: "Outfit-Regular",
    marginTop: spacing.xs,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  searchContainerWrapper: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xs,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: normalize(12),
    paddingHorizontal: spacing.m,
    height: normalize(50),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    height: normalize(50),
    fontSize: fontSizes.l,
    fontFamily: "Outfit-Regular",
    color: "#333",
  },
  sectionLabel: {
    fontSize: fontSizes.s,
    color: "#666",
    fontFamily: "Outfit-Bold",
    marginLeft: spacing.m,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  categoriesContainer: {
    marginBottom: spacing.l,
  },
  categoriesContent: {
    paddingHorizontal: spacing.s,
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: spacing.xs,
    width: normalize(80),
    borderRadius: normalize(12),
  },
  categoryItemActive: {
    backgroundColor: "transparent",
  },
  categoryIconContainer: {
    position: "relative",
    marginBottom: spacing.xs,
    borderRadius: normalize(20),
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(20),
  },
  categorySelectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(37, 150, 190, 0.3)",
    borderWidth: 3,
    borderColor: "#2596be",
    borderRadius: normalize(20),
  },
  categoryName: {
    fontSize: fontSizes.s,
    textAlign: "center",
    color: "#444",
    fontFamily: "Outfit-Regular",
  },
  categoryNameActive: {
    color: "#2596be",
    fontFamily: "Outfit-Bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: fontSizes.l,
    color: "#333",
    fontWeight: "600",
    fontFamily: "Outfit-Bold",
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: fontSizes.m,
    color: "#2596be",
    fontFamily: "Outfit-Regular",
  },
  favoritesContainer: {
    marginBottom: spacing.l,
  },
  favoritesContent: {
    paddingHorizontal: spacing.s,
    paddingBottom: spacing.s,
  },
  favoriteItemContainer: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
  },

  favoriteItem: {
    borderRadius: normalize(16),
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  favoriteImage: {
    width: "100%",
    height: normalize(160),
  },
  favoriteImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: normalize(80),
  },
  favoriteContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.m,
  },
  favoriteRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  favoriteRatingText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: spacing.xs,
    fontSize: fontSizes.m,
    fontFamily: "Outfit-Bold",
  },
  favoriteReviewsText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: fontSizes.s,
    marginLeft: spacing.xs,
    fontFamily: "Outfit-Light",
  },
  favoriteName: {
    fontSize: fontSizes.l,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: spacing.xs,
    fontFamily: "Outfit-Bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  favoriteAddress: {
    fontSize: fontSizes.s,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Outfit-Light",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyFavoritesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.l,
    backgroundColor: "#fff",
    margin: spacing.m,
    borderRadius: normalize(16),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyIcon: {
    marginBottom: spacing.m,
  },
  noFavoritesText: {
    fontSize: fontSizes.l,
    color: "#333",
    marginBottom: spacing.xs,
    fontFamily: "Outfit-Bold",
    textAlign: "center",
  },
  noFavoritesSubtext: {
    fontSize: fontSizes.m,
    color: "#666",
    marginBottom: spacing.l,
    fontFamily: "Outfit-Light",
    textAlign: "center",
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2596be",
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: normalize(25),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: fontSizes.m,
    fontWeight: "600",
    fontFamily: "Outfit-Bold",
  },
  upcomingAppointments: {
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    backgroundColor: "#fff",
    borderRadius: normalize(12),
    marginBottom: spacing.s,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentDateContainer: {
    width: normalize(80),
    marginRight: spacing.m,
  },
  appointmentDay: {
    fontSize: fontSizes.m,
    fontWeight: "bold",
    color: "#2596be",
    fontFamily: "Outfit-Bold",
  },
  appointmentTime: {
    fontSize: fontSizes.s,
    color: "#666",
    marginTop: spacing.xs,
    fontFamily: "Outfit-Light",
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentBusinessName: {
    fontSize: fontSizes.m,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Outfit-Bold",
  },
  appointmentServiceName: {
    fontSize: fontSizes.s,
    color: "#666",
    marginTop: spacing.xs,
    fontFamily: "Outfit-Light",
  },
  noAppointments: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.l,
    backgroundColor: "#fff",
    margin: spacing.m,
    borderRadius: normalize(16),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noAppointmentsText: {
    fontSize: fontSizes.l,
    color: "#333",
    marginBottom: spacing.xs,
    fontFamily: "Outfit-Bold",
    textAlign: "center",
  },
  noAppointmentsSubtext: {
    fontSize: fontSizes.m,
    color: "#666",
    marginBottom: spacing.l,
    fontFamily: "Outfit-Light",
    textAlign: "center",
  },
  bookNowButton: {
    backgroundColor: "#2596be",
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: normalize(25),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bookNowButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: fontSizes.m,
    fontFamily: "Outfit-Bold",
  },
  appointmentStatus: {
    marginLeft: spacing.s,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: fontSizes.s,
    fontWeight: "500",
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: normalize(12),
    overflow: "hidden",
    fontFamily: "Outfit-Bold",
  },
  businessList: {
    padding: spacing.m,
  },
  businessCard: {
    position: "relative",
    marginBottom: spacing.m,
    borderRadius: normalize(12),
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessImage: {
    width: "100%",
    height: normalize(180),
  },
  businessImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: normalize(80),
  },
  businessInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.m,
  },
  businessName: {
    fontSize: fontSizes.l,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Outfit-Bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  businessAddress: {
    fontSize: fontSizes.s,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: spacing.xs,
    fontFamily: "Outfit-Light",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomSpacer: {
    height: normalize(60),
  },
});
