"use client";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointments,
  cancelAppointment,
} from "../../services/appointment.service";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useState } from "react";

export default function AppointmentsScreen() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: appointmentsResponse,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });

  // Extract appointments and error from the response
  const appointments = appointmentsResponse?.data || [];
  const error = appointmentsResponse?.error;

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../../assets/images/images.jpeg")}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Appointments Yet</Text>
      <Text style={styles.emptyText}>
        You haven't made any appointments yet. Start exploring and book your
        first appointment!
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
        size={80}
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

    const appointmentTime = item.appointmentTime
      ? new Date(item.appointmentTime)
      : new Date();

    return (
      <TouchableOpacity style={styles.appointmentCard} onPress={() => {}}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.businessName}>
            {item.business?.name || "Business"}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "confirmed" ? "#4CAF50" : "#FFC107",
                },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{serviceName}</Text>
            <Text style={styles.serviceTime}>
              {appointmentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View style={styles.durationInfo}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.durationText}>{totalDuration} minutes</Text>
          </View>

          <View style={styles.staffInfo}>
            <Text style={styles.staffLabel}>Staff:</Text>
            <Text style={styles.staffName}>
              {item.worker?.firstName} {item.worker?.lastName}
            </Text>
          </View>

          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Total Price:</Text>
            <Text style={styles.priceValue}>${item.totalPrice}</Text>
          </View>
        </View>

        <View style={styles.appointmentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log("Reschedule pressed")}
          >
            <Text style={styles.actionButtonText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {
              console.log("Cancel button pressed");
              handleCancelAppointment(item.id);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Text style={styles.title}>Appointments</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading appointments...</Text>
        </View>
      ) : isError || error ? (
        renderErrorState()
      ) : !appointments?.length ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          contentContainerStyle={styles.appointmentsList}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 20,
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
    padding: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: "#1B9AAA",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  appointmentsList: {
    padding: 15,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  appointmentDetails: {
    marginBottom: 15,
  },
  serviceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "500",
  },
  serviceTime: {
    fontSize: 16,
    color: "#666",
  },
  durationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  durationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  staffInfo: {
    flexDirection: "row",
    marginBottom: 5,
  },
  staffLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  staffName: {
    fontSize: 14,
    fontWeight: "500",
  },
  priceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B9AAA",
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#000",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  cancelButtonText: {
    color: "#ff3b30",
  },
});
