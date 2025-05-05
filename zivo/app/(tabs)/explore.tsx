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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ color: "#fff", fontSize: 35, fontWeight: "bold" }}>
          Explore
        </Text>
      </View>

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
            <Ionicons name="location-outline" size={20} color="#000" />
            <Text style={styles.locationText}>Near You</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={20} color="#000" />
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
              size={16}
              color="#666"
              style={{ marginLeft: 4 }}
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
          contentContainerStyle={styles.businessList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 5,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
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
    fontFamily: "Outfit-Regular",
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // Eğer gap çalışmazsa aşağıdaki gibi marginLeft ver
  },
  locationText: {
    fontSize: 16,
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Regular",
  },
  contentContainer: {
    // This container wraps categories, sort and results to keep them together
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    height: 40, // Reduced height
    marginBottom: 0, // Removed bottom margin completely
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    height: 40,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategory: {
    borderBottomWidth: 2,
    borderBottomColor: "#1B9AAA",
  },
  categoryText: {
    fontSize: 16,
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
    padding: 16,
    paddingTop: 8, // Reduced top padding
    paddingBottom: 8, // Reduced bottom padding
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortTitle: {
    marginRight: 8,
    color: "#666",
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Regular",
  },
  sortTextActive: {
    color: "#fff",
  },
  resultsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10, // Reduced top padding
    paddingBottom: 10, // Reduced bottom padding
  },
  resultsText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Regular",
  },
  reviewsText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Outfit-Light",
  },
  businessName: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 10,
    marginHorizontal: 10,
    fontFamily: "Outfit-Bold",
  },
  businessAddress: {
    fontSize: 16,
    color: "#666",
    marginHorizontal: 10,
    marginBottom: 10,
    fontFamily: "Outfit-Light",
  },
});
