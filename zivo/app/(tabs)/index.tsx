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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getAllBusinesses } from "../../services/business.service";
import { getAppointments } from "../../services/appointment.service";
import { getFavorites } from "../../services/favorite.service";
import type { Business } from "../../types";
import { useState, useMemo, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import React from "react";





const categories = [
  {
    id: "massage",
    name: "Massage",
    icon: require("../../assets/images/images.jpeg"),
    businessTypeId: "c434d876-adf7-41e8-a903-c18af53c8fe6",
  },
  {
    id: "spa",
    name: "Day SPA",
    icon: require("../../assets/images/spa.jpg"),
    businessTypeId: "28ec23f3-73c0-47fb-a72c-dc94da77dacf",
  },
  {
    id: "skin",
    name: "Skin care",
    icon: require("../../assets/images/Facial-providence-ri.jpg"),
    businessTypeId: "ed90a82e-0041-4414-8772-d2aabf15f4cb",
  },
  {
    id: "pet",
    name: "Pet services",
    icon: require("../../assets/images/pet-sitters.jpg"),
    businessTypeId: "58858f87-0060-4869-a83c-c838cd1c1e29",
  },
  {
    id: "hair",
    name: "Hair salons",
    icon: require("../../assets/images/24pt-tif-gould-sprowston-240208-20-1400x800.jpg"),
    businessTypeId: "26a88520-e2b2-4e2d-87cb-9348026185f7",
  },
];



export default function HomeScreen() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
    }, [])
  );

  const { data: favoriteList = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });
  

  const { data: businesses, isLoading: isBusinessesLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: getAllBusinesses,
  });




  const { data: appointmentResult, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });

  console.log("Appointments 👉", appointmentResult);
  
  const appointments = appointmentResult?.data || [];
  

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];

    return businesses.filter((business) => {
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
    setSelectedType(
      selectedType === category.businessTypeId ? null : category.businessTypeId
    );
    setShowSearchResults(selectedType !== category.businessTypeId); // ✔️ BU!
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

  if (isAuthLoading || isBusinessesLoading || isAppointmentsLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
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
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessAddress}>
          {renderAddress(item.address)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ✅ Sabit header */}
      <View style={styles.header}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          zivo
        </Text>
      </View>

      {/* 🔽 Scroll edilebilir içerik */}
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={handleSearchBarPress}
        >
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            value={searchQuery}
            onChangeText={handleSearch}
            editable={false}
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedType === category.businessTypeId &&
                  styles.categoryItemActive,
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Image
                source={category.icon}
                style={[
                  styles.categoryIcon,
                  selectedType === category.businessTypeId &&
                    styles.categoryIconActive,
                ]}
              />
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
          ))}
        </ScrollView>

        {showSearchResults ? (
          <FlatList
            data={filteredBusinesses}
            renderItem={renderBusinessItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.businessList}
          />
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>FAVORITES</Text>
            </View>

            <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={styles.favoritesContainer}
>
  {favoriteList.map((fav) => (
    <TouchableOpacity
      key={fav.business.id}
      style={styles.favoriteItem}
      onPress={() => navigateTo(`/${fav.business.id}`)}
    >
      {fav.business.coverImageUrl && (
        <Image
          source={{ uri: fav.business.coverImageUrl }}
          style={styles.favoriteImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.favoriteRating}>
        <Text style={styles.favoriteRatingText}>
          {fav.business.rating?.toFixed(1) || "0.0"}
        </Text>
        <Text style={styles.favoriteReviewsText}>
          {fav.business.reviews || 0} reviews
        </Text>
      </View>
      <Text style={styles.favoriteName}>{fav.business.name}</Text>
      <Text style={styles.favoriteAddress}>
        {renderAddress(fav.business.address)}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MY APPOINTMENTS</Text>
            </View>

            <TouchableOpacity
              style={styles.appointmentsButton}
              onPress={() => navigateTo("/(tabs)/appointments")}
            >
              <Text style={styles.appointmentsButtonText}>
              {isAppointmentsLoading ? (
  "Loading appointments..."
) : Array.isArray(appointments) && appointments.length > 0 ? (
  `You have ${appointments.length} appointments`
) : (
  "No appointments yet"
)}

</Text>

              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#2596be",
  },
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
    padding: 11,
    alignItems: "center",
    backgroundColor: "#2596be",
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
  categoriesContainer: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: "center",
    marginHorizontal: 10,
    width: 80,
    padding: 8,
    borderRadius: 8,
  },
  categoryItemActive: {
    backgroundColor: "#1B9AAA",
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  categoryIconActive: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  categoryNameActive: {
    color: "#fff",
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  favoritesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  favoriteItem: {
    width: 200,
    marginHorizontal: 5,
  },
  favoriteImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 5,
  },
  favoriteRating: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    padding: 5,
  },
  favoriteRatingText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  favoriteReviewsText: {
    color: "#fff",
    fontSize: 10,
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  favoriteAddress: {
    fontSize: 12,
    color: "#666",
  },
  appointmentsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 8,
  },
  appointmentsButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  businessList: {
    padding: 16,
  },
  businessCard: {
    marginBottom: 16,
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
  businessInfo: {
    padding: 12,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  businessAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
