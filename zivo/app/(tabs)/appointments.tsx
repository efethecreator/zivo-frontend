"use client";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointments,
  cancelAppointment,
} from "../../services/appointment.service";
import { createReview } from "../../services/review.service";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useState, useMemo } from "react";
import RNModal from "react-native-modal";
import { useAuth } from "../../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { normalize, fontSizes, spacing } from "../../utils/responsive";
import { SafeAreaWrapper } from "../../components/SafeAreaWrapper";

type AppointmentStatus =
  | "all"
  | "confirmed"
  | "pending"
  | "cancelled"
  | "today";

export default function AppointmentsScreen() {
  // useAuth'dan tokenAvailable'ı alalım
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>("all");
  const { tokenAvailable } = useAuth(); // useAuth'dan tokenAvailable'ı alalım
  const insets = useSafeAreaInsets();

  const {
    data: appointmentsResponse,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
    enabled: !!tokenAvailable, // Token varsa çalıştır
  });

  // Extract appointments and error from the response
  const appointments = appointmentsResponse?.data || [];
  const error = appointmentsResponse?.error;

  // Filter appointments based on selected status
  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") {
      return appointments;
    }

    if (statusFilter === "today") {
      // Get today's date at the start of the day (00:00:00) in local time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get tomorrow's date at the start of the day for comparison
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return appointments.filter(
        (appointment: { appointmentTime: string | number | Date }) => {
          if (!appointment.appointmentTime) return false;

          // Convert appointment time to Date object
          const appointmentDate = new Date(appointment.appointmentTime);

          // Check if appointment is today (between start of today and start of tomorrow)
          return appointmentDate >= today && appointmentDate < tomorrow;
        }
      );
    }

    return appointments.filter(
      (appointment: { status: string }) => appointment.status === statusFilter
    );
  }, [appointments, statusFilter]);

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      Toast.show({
        type: "success",
        text1: "Appointment Cancelled",
        text2: "Your appointment has been cancelled successfully",
      });
    },
    onError: (error) => {
      console.error("Error canceling appointment:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to cancel appointment. Please try again.",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Review Submitted",
        text2: "Your review has been submitted successfully",
      });
      // Reset form and close modal
      setModalVisible(false);
      setRating(0);
      setComment("");
      setSelectedAppointmentId(null);
      // Refresh appointments to update UI
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      console.error("Error submitting review:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to submit review. Please try again.",
      });
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelAppointment = (id: string) => {
    console.log("Cancel button clicked for appointment:", id);
    Toast.show({
      type: "info",
      text1: "Cancel Appointment",
      text2: "Are you sure you want to cancel this appointment?",
      position: "top",
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
      onPress: () => {
        console.log("Toast pressed, cancelling appointment:", id);
        cancelMutation.mutate(id);
      },
    });
  };

  const handleOpenReviewModal = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setRating(0);
    setComment("");
    setModalVisible(true);
  };

  const handleSubmitReview = () => {
    if (!selectedAppointmentId) return;
    if (rating === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a rating",
      });
      return;
    }

    reviewMutation.mutate({
      appointmentId: selectedAppointmentId,
      rating,
      comment,
    });
  };

  const StarRating = () => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <AntDesign
              name={rating >= star ? "star" : "staro"}
              size={normalize(30)}
              color={rating >= star ? "#FFD700" : "#CCCCCC"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../../assets/images/spa.jpg")}
        style={styles.emptyIcon}
        resizeMode="cover"
      />
      <Text style={styles.emptyTitle}>No Appointments Found</Text>
      <Text style={styles.emptyText}>
        {statusFilter !== "all"
          ? `You don't have any ${statusFilter} appointments.`
          : "You haven't made any appointments yet. Start exploring and book your first appointment!"}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)/explore")}
      >
        <Text style={styles.emptyButtonText}>Explore Services</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="alert-circle-outline"
        size={normalize(80)}
        color="#ff3b30"
        style={styles.errorIcon}
      />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptyText}>
        {error ||
          "We couldn't load your appointments. Please check your connection and try again."}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleRefresh}>
        <Text style={styles.emptyButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppointmentItem = ({ item }: { item: any }) => {
    console.log("Rendering appointment item:", item);
    const firstService = item.appointmentServices?.[0]?.service;
    const serviceName = firstService?.name || "Service not specified";
    const totalDuration =
      item.appointmentServices?.reduce(
        (acc: number, curr: any) => acc + (curr.durationAtBooking || 0),
        0
      ) || 0;

    const appointmentTimeString = item.appointmentTime
      ? item.appointmentTime.slice(11, 16) // "HH:MM" formatı
      : "--:--";
    const appointmentDateString = item.appointmentTime
      ? item.appointmentTime.slice(0, 10) // YYYY-MM-DD formatı
      : "--/--/----";

    // Check if this appointment already has a review
    const hasReview = item.review !== undefined && item.review !== null;

    // Get status badge color
    const getStatusBadgeColor = () => {
      switch (item.status) {
        case "confirmed":
          return "#4CAF50";
        case "cancelled":
          return "#FF5252";
        case "pending":
          return "#FFC107";
        default:
          return "#FFC107";
      }
    };

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.businessName}>
            {item.business?.name || "Business"}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBadgeColor() },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.serviceName}>{serviceName}</Text>

        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={normalize(16)} color="#666" />
          <Text style={styles.durationText}>{totalDuration} minutes</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.appointmentTime}>{appointmentTimeString}</Text>
            <Text style={styles.appointmentDate}>{appointmentDateString}</Text>
          </View>
        </View>

        <View style={styles.staffRow}>
          <Text style={styles.staffLabel}>Staff:</Text>
          <Text style={styles.staffName}>
            {item.worker?.firstName} {item.worker?.lastName}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total Price:</Text>
          <Text style={styles.priceValue}>${item.totalPrice}</Text>
        </View>

        <View style={styles.appointmentActions}>
          {item.status === "confirmed" ? (
            hasReview ? (
              <View style={styles.feedbackContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={normalize(16)}
                  color="#4CAF50"
                  style={styles.feedbackIcon}
                />
                <Text style={styles.feedbackText}>
                  Thanks for the feedback!
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton]}
                onPress={() => handleOpenReviewModal(item.id)}
              >
                <Text style={styles.reviewButtonText}>Leave a Comment</Text>
              </TouchableOpacity>
            )
          ) : item.status === "cancelled" ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => router.push(`/${item.business?.id}`)}
            >
              <Text style={styles.reviewButtonText}>Contact the Business</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/booking/${item.id}/reschedule`)}
              >
                <Text style={styles.actionButtonText}>Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleCancelAppointment(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderFilterTabs = () => {
    const filters: { id: AppointmentStatus; label: string }[] = [
      { id: "today", label: "Today" },
      { id: "all", label: "All" },
      { id: "confirmed", label: "Confirmed" },
      { id: "pending", label: "Pending" },
      { id: "cancelled", label: "Cancelled" },
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              statusFilter === filter.id && styles.activeFilterTab,
            ]}
            onPress={() => setStatusFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === filter.id && styles.activeFilterText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaWrapper style={styles.container} backgroundColor="#f8f9fa">
      <StatusBar style="dark" backgroundColor="#fff" />
      <Text style={[styles.title, { marginTop: normalize(1) }]}>
        Appointments
      </Text>

      {renderFilterTabs()}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading appointments...</Text>
        </View>
      ) : isError || error ? (
        renderErrorState()
      ) : !filteredAppointments?.length ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          contentContainerStyle={[
            styles.appointmentsList,
            { paddingBottom: insets.bottom + normalize(20) },
          ]}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      )}
      <RNModal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        backdropTransitionOutTiming={0}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.4}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Leave a Review</Text>
          <StarRating />
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience..."
            placeholderTextColor="#888"
            multiline={true}
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmitReview}
              disabled={reviewMutation.isPending}
            >
              <Text style={styles.submitButtonText}>
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: fontSizes.header,
    fontWeight: "bold",
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    fontFamily: "Outfit-Bold",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
    justifyContent: "space-between",
  },
  filterTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    borderRadius: normalize(25),
    backgroundColor: "#f5f5f5",
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: "center",
  },
  activeFilterTab: {
    backgroundColor: "#1B9AAA",
  },
  appointmentDate: {
    fontSize: fontSizes.s,
    color: "#999",
    fontFamily: "Outfit-Regular",
    marginTop: spacing.xs,
  },

  filterText: {
    fontSize: fontSizes.m,
    color: "#666",
    fontFamily: "Outfit-Bold",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.l,
  },
  emptyIcon: {
    width: normalize(120),
    height: normalize(120),
    borderRadius: normalize(10),
    marginBottom: spacing.l,
  },
  errorIcon: {
    marginBottom: spacing.l,
  },
  emptyTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: "bold",
    marginBottom: spacing.s,
    fontFamily: "Outfit-Bold",
  },
  emptyText: {
    fontSize: fontSizes.m,
    color: "#666",
    textAlign: "center",
    marginBottom: spacing.xl,
    fontFamily: "Outfit-Light",
  },
  emptyButton: {
    backgroundColor: "#1B9AAA",
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xl,
    borderRadius: normalize(8),
    width: "100%",
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: fontSizes.m,
    fontWeight: "600",
    fontFamily: "Outfit-Bold",
  },
  appointmentsList: {
    padding: spacing.s,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: normalize(10),
    marginBottom: spacing.s,
    padding: spacing.s,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  businessName: {
    fontSize: fontSizes.l,
    fontWeight: "bold",
    fontFamily: "Outfit-Bold",
  },
  statusBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: normalize(20),
  },
  statusText: {
    color: "#fff",
    fontSize: fontSizes.s,
    fontWeight: "600",
    textTransform: "capitalize",
    fontFamily: "Outfit-Bold",
  },
  serviceName: {
    fontSize: fontSizes.m,
    marginBottom: spacing.xs,
    fontFamily: "Outfit-Light",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  durationText: {
    fontSize: fontSizes.m,
    color: "#666",
    marginLeft: spacing.xs,
    flex: 1,
    fontFamily: "Outfit-Light",
  },
  appointmentTime: {
    fontSize: fontSizes.m,
    fontWeight: "500",
    color: "#666",
    fontFamily: "Outfit-Bold",
  },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  staffLabel: {
    fontSize: fontSizes.m,
    color: "#666",
    marginRight: spacing.xs,
    fontFamily: "Outfit-Light",
  },
  staffName: {
    fontSize: fontSizes.m,
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.s,
  },
  priceLabel: {
    fontSize: fontSizes.m,
    color: "#666",
    fontFamily: "Outfit-Light",
  },
  priceValue: {
    fontSize: fontSizes.l,
    fontWeight: "600",
    color: "#1B9AAA",
    fontFamily: "Outfit-Bold",
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: spacing.s,
    borderRadius: normalize(6),
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },

  actionButtonText: {
    color: "#000",
    fontSize: fontSizes.m,
    fontWeight: "500",
    fontFamily: "Outfit-Regular",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  cancelButtonText: {
    color: "#ff3b30",
    fontSize: fontSizes.m,
    fontWeight: "500",
    fontFamily: "Outfit-Bold",
  },
  reviewButton: {
    backgroundColor: "#1B9AAA",
    flex: 1,
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: fontSizes.m,
    fontFamily: "Outfit-Bold",
  },
  feedbackContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9f8",
    padding: spacing.s,
    borderRadius: normalize(6),
  },
  feedbackIcon: {
    marginRight: spacing.xs,
  },
  feedbackText: {
    color: "#4CAF50",
    fontWeight: "500",
    fontSize: fontSizes.m,
    fontFamily: "Outfit-Bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.l,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: normalize(12),
    padding: spacing.l,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "bold",
    marginBottom: spacing.l,
    textAlign: "center",
    fontFamily: "Outfit-Bold",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.l,
  },
  starButton: {
    padding: spacing.xs,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: normalize(8),
    padding: spacing.s,
    minHeight: normalize(100),
    textAlignVertical: "top",
    marginBottom: spacing.l,
    fontFamily: "Outfit-Regular",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: spacing.s,
    borderRadius: normalize(8),
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  cancelModalButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelModalButtonText: {
    color: "#666",
    fontFamily: "Outfit-Bold",
  },
  submitButton: {
    backgroundColor: "#1B9AAA",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Outfit-Bold",
  },
});
