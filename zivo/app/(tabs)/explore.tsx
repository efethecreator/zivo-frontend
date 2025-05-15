"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  searchBusinesses,
  type Business,
  type SearchParams,
} from "../../services/business.service";
import {
  getReviewsForBusiness,
  calculateBusinessRating,
} from "../../services/review.service";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalize, fontSizes, spacing } from "../../utils/responsive";
import { SafeAreaWrapper } from "../../components/SafeAreaWrapper";

const categories = [
  { id: "all", name: "All" },
  { id: "26a88520-e2b2-4e2d-87cb-9348026185f7", name: "Barber" },
  { id: "c434d876-adf7-41e8-a903-c18af53c8fe6", name: "Massage" },
  { id: "28ec23f3-73c0-47fb-a72c-dc94da77dacf", name: "Day SPA" },
  { id: "dfe8118a-4b96-4366-839e-899ff802fba8", name: "Hair Salons" },
  { id: "ed90a82e-0041-4414-8772-d2aabf15f4cb", name: "Skin Care" },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortBy, setSortBy] = useState<SearchParams["sortBy"]>("name");
  const [businessReviews, setBusinessReviews] = useState<
    Record<string, { rating: number; count: number }>
  >({});
  const insets = useSafeAreaInsets();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["businesses", searchQuery, selectedType, sortBy],
    queryFn: () =>
      searchBusinesses({
        search: searchQuery,
        type: selectedType,
        sortBy,
      }),
  });

  // Fetch reviews for each business
  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const fetchReviewsForBusinesses = async () => {
        const reviewsData: Record<string, { rating: number; count: number }> =
          {};

        for (const business of businesses) {
          if (business.id) {
            try {
              const reviews = await getReviewsForBusiness(
                business.id.toString()
              );
              const { rating, count } = calculateBusinessRating(
                reviews,
                business.id.toString()
              );
              reviewsData[business.id.toString()] = { rating, count };
            } catch (error) {
              console.error(
                `Error fetching reviews for business ${business.id}:`,
                error
              );
              reviewsData[business.id.toString()] = { rating: 0, count: 0 };
            }
          }
        }

        setBusinessReviews(reviewsData);
      };

      fetchReviewsForBusinesses();
    }
  }, [businesses]);

  const getBusinessRating = (businessId: string) => {
    return businessReviews[businessId] || { rating: 0, count: 0 };
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

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleTypeFilter = (typeId: string) => {
    if (typeId === "all") {
      setSelectedType("");
    } else {
      setSelectedType(typeId === selectedType ? "" : typeId);
    }
  };

  const handleSort = (sortOption: SearchParams["sortBy"]) => {
    setSortBy(sortOption);
  };

  const handleNearYouPress = () => {
    router.push("/(tabs)/map");
  };

  const renderBusinessItem = ({ item }: { item: Business }) => {
    const { rating, count } = getBusinessRating(item.id?.toString() || "");
    return (
      <TouchableOpacity
        style={styles.businessCard}
        onPress={() => router.push(`/${item.id?.toString()}` as any)}
      >
        {item.coverImageUrl && (
          <Image
            source={{ uri: item.coverImageUrl }}
            style={styles.businessImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <Text style={styles.reviewsText}>{count} reviews</Text>
        </View>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessAddress}>
          {renderAddress(item.address)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaWrapper style={styles.container} backgroundColor="#f8f9fa">
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={normalize(20)}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholderTextColor="#8888"
          placeholder="Search for service or business name"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleNearYouPress}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name="location-outline"
              size={normalize(20)}
              color="#000"
            />
            <Text style={styles.locationText}>Near You</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={normalize(20)} color="#000" />
          <Text style={styles.dateText}>When?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedType === (category.id === "all" ? "" : category.id) &&
                  styles.selectedCategory,
              ]}
              onPress={() => handleTypeFilter(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedType === (category.id === "all" ? "" : category.id) &&
                    styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            Results ({businesses?.length || 0})
          </Text>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={styles.infoText}>
              What affects the search results?
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={normalize(16)}
              color="#666"
              style={{ marginLeft: spacing.xs }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B9AAA" />
        </View>
      ) : (
        <FlatList
          data={businesses}
          renderItem={renderBusinessItem}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.businessList,
            { paddingBottom: insets.bottom + normalize(20) },
          ]}
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: spacing.xs,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  logo: {
    fontSize: fontSizes.xxl,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.m,
    paddingHorizontal: spacing.m,
    backgroundColor: "#f5f5f5",
    borderRadius: normalize(8),
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    height: normalize(45),
    fontSize: fontSizes.l,
    fontFamily: "Outfit-Regular",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  locationButton: {
    flex: 1,
    height: normalize(45),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: normalize(8),
    marginRight: spacing.s,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs, // Eğer gap çalışmazsa aşağıdaki gibi marginLeft ver
  },
  locationText: {
    fontSize: fontSizes.l,
    fontFamily: "Outfit-Regular",
  },
  dateButton: {
    flex: 1,
    height: normalize(45),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: normalize(8),
  },
  dateText: {
    fontSize: fontSizes.l,
    marginLeft: spacing.xs,
    fontFamily: "Outfit-Regular",
  },
  contentContainer: {
    // This container wraps categories, sort and results to keep them together
  },
  categoriesContainer: {
    paddingHorizontal: spacing.s,
    height: normalize(40), // Reduced height
    marginBottom: 0, // Removed bottom margin completely
  },
  categoryButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    height: normalize(40),
    minWidth: normalize(80),
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategory: {
    borderBottomWidth: 2,
    borderBottomColor: "#1B9AAA",
  },
  categoryText: {
    fontSize: fontSizes.l,
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
  selectedCategoryText: {
    color: "#000",
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.m,
    paddingTop: spacing.xs, // Reduced top padding
    paddingBottom: spacing.xs, // Reduced bottom padding
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortTitle: {
    marginRight: spacing.xs,
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
  sortButton: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: normalize(16),
    backgroundColor: "#f0f0f0",
    marginRight: spacing.xs,
  },
  sortButtonActive: {
    backgroundColor: "#1B9AAA",
  },
  sortText: {
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
  sortTextActive: {
    color: "#fff",
  },
  resultsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s, // Reduced top padding
    paddingBottom: spacing.s, // Reduced bottom padding
  },
  resultsText: {
    fontSize: fontSizes.l,
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  infoText: {
    fontSize: fontSizes.m,
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  businessList: {
    padding: spacing.m,
  },
  businessCard: {
    marginBottom: spacing.l,
    borderRadius: normalize(8),
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
    height: normalize(200),
    borderTopLeftRadius: normalize(8),
    borderTopRightRadius: normalize(8),
  },
  ratingContainer: {
    position: "absolute",
    top: spacing.s,
    right: spacing.s,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: normalize(4),
    padding: spacing.xs,
  },
  ratingText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Outfit-Regular",
  },
  reviewsText: {
    color: "#fff",
    fontSize: fontSizes.xs,
    fontFamily: "Outfit-Light",
  },
  businessName: {
    fontSize: fontSizes.xl,
    fontWeight: "bold",
    marginTop: spacing.s,
    marginHorizontal: spacing.s,
    fontFamily: "Outfit-Bold",
  },
  businessAddress: {
    fontSize: fontSizes.l,
    color: "#666",
    marginHorizontal: spacing.s,
    marginBottom: spacing.s,
    fontFamily: "Outfit-Light",
  },
});
