import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { getMyReviews } from "../services/review.service"
import { format } from "date-fns"

export default function ReviewsScreen() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['myReviews'],
    queryFn: getMyReviews,
  });

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={16}
        color="#2596be"
        style={styles.star}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2596be" />
        </View>
      ) : reviews?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{
              uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/reviews.jpg-f5udk4A5cDGCOMIsqf2YVmaFw3uXCm.jpeg",
            }}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.title}>Your reviews</Text>
          <Text style={styles.description}>Share experiences after your appointments!</Text>
          <Text style={styles.subDescription}>All of your reviews will show up here.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {reviews?.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.userIcon}>
                  <Ionicons name="person-circle-outline" size={40} color="#2596be" />
                </View>
                <View style={styles.reviewInfo}>
                  <View style={styles.ratingContainer}>
                    {renderStars(review.rating)}
                  </View>
                  <Text style={styles.reviewDate}>
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userIcon: {
    marginRight: 15,
  },
  reviewInfo: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  star: {
    marginRight: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  illustration: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  subDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

