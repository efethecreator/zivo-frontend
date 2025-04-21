"use client"

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getServiceById } from "../../services/service.service";
import { createAppointment } from "../../services/appointment.service";
import { Service } from "../../types";
import { useAuth } from "../../context/AuthContext";

type CalendarDay = {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
};

const daysOfWeek = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];

// Generate calendar days for April 2025
const generateCalendarDays = (): CalendarDay[] => {
  const days: CalendarDay[] = [];
  // Start with March 31 (previous month)
  days.push({ day: 31, month: 3, year: 2025, isCurrentMonth: false });

  // April has 30 days
  for (let i = 1; i <= 30; i++) {
    days.push({ day: i, month: 4, year: 2025, isCurrentMonth: true });
  }

  // Add first few days of May
  for (let i = 1; i <= 4; i++) {
    days.push({ day: i, month: 5, year: 2025, isCurrentMonth: false });
  }

  return days;
};

const timeSlots = ["19:30", "20:00", "20:30"];

export default function BookingScreen() {
  const { appointmentId } = useLocalSearchParams();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<CalendarDay>({
    day: 11,
    month: 4,
    year: 2025,
    isCurrentMonth: true,
  });
  const [selectedTime, setSelectedTime] = useState("19:30");
  const [staff, setStaff] = useState({
    name: "Mudie",
    image: require("../../assets/images/barber1.jpg"),
  });

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', appointmentId],
    queryFn: () => getServiceById(appointmentId as string),
  });

  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      Alert.alert("Success", "Appointment created successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create appointment");
      console.error("Appointment creation error:", error);
    },
  });

  const calendarDays = generateCalendarDays();

  const handleContinue = async () => {
    if (!service || !user) return;

    try {
      // Format the appointment time
      const appointmentTime = new Date(
        selectedDate.year,
        selectedDate.month - 1,
        selectedDate.day,
        parseInt(selectedTime.split(":")[0]),
        parseInt(selectedTime.split(":")[1])
      ).toISOString();

      // Ensure price is a number
      const servicePrice = typeof service.price === 'string' 
        ? parseFloat(service.price) 
        : service.price;

      // Create appointment data
      const appointmentData = {
        businessId: service.businessId,
        workerId: "00d8a113-e0d2-4eff-825c-f68dd09c0ef0", // This should come from staff selection
        appointmentTime,
        totalPrice: servicePrice,
        services: [
          {
            serviceId: service.id,
            price: servicePrice,
            duration: service.duration,
          },
        ],
      };

      console.log("Creating appointment with data:", appointmentData);

      await createAppointmentMutation.mutateAsync(appointmentData);
    } catch (error) {
      console.error("Error creating appointment:", error);
      Alert.alert(
        "Error", 
        "Failed to create appointment. Please check the console for details."
      );
    }
  };

  if (isLoading || !service) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2596be" />
      </View>
    );
  }

  const getEndTime = (startTime: string, duration: number) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const totalMinutes = startHour * 60 + startMinute + duration;

    const endHour = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const endMinute = (totalMinutes % 60).toString().padStart(2, "0");

    return `${endHour}:${endMinute}`;
  };

  // Helper function to safely render price
  const renderPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return price.toFixed(2)
    }
    return price
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book an Appointment</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Text style={styles.monthTitle}>April 2025</Text>

          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day, index) => (
              <Text key={index} style={styles.dayOfWeekText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  day.isCurrentMonth ? {} : styles.otherMonthDay,
                  selectedDate.day === day.day && selectedDate.month === day.month
                    ? styles.selectedDay
                    : {},
                ]}
                onPress={() => setSelectedDate(day)}
                disabled={!day.isCurrentMonth}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    day.isCurrentMonth ? {} : styles.otherMonthDayText,
                    selectedDate.day === day.day && selectedDate.month === day.month
                      ? styles.selectedDayText
                      : {},
                  ]}
                >
                  {day.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.timeSlotsContainer}>
          {timeSlots.map((time, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlot,
                selectedTime === time ? styles.selectedTimeSlot : {},
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === time ? styles.selectedTimeSlotText : {},
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Service Details */}
        <View style={styles.serviceDetailsContainer}>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceTime}>
              {`${selectedTime} - ${getEndTime(selectedTime, service.duration)}`}
            </Text>
          </View>

          <View style={styles.staffContainer}>
            <Text style={styles.staffLabel}>Staff:</Text>
            <View style={styles.staffInfo}>
              <Image source={staff.image} style={styles.staffImage} />
              <Text style={styles.staffName}>{staff.name}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addServiceButton}>
            <Ionicons name="add" size={20} color="#2596be" />
            <Text style={styles.addServiceText}>Add another service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>€ {renderPrice(service.price)}</Text>
          <Text style={styles.priceSubtext}>{service.duration} min</Text>
        </View>

        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinue}
          disabled={createAppointmentMutation.isPending}
        >
          {createAppointmentMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Privacy Info */}
      <Text style={styles.privacyText}>
        Your personal data will be processed by the partner with whom you are
        booking an appointment. You can find more information{" "}
        <Text style={styles.privacyLink}>here</Text>.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 15,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  calendarContainer: {
    padding: 15,
    backgroundColor: "#fff",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  daysOfWeekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarDayText: {
    fontSize: 16,
    color: "#000",
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthDayText: {
    color: "#666",
  },
  selectedDay: {
    backgroundColor: "#2596be",
    borderRadius: 20,
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "600",
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  timeSlotText: {
    fontSize: 16,
    color: "#666",
  },
  selectedTimeSlot: {
    backgroundColor: "#2596be",
  },
  selectedTimeSlotText: {
    color: "#fff",
  },
  serviceDetailsContainer: {
    padding: 15,
    backgroundColor: "#fff",
  },
  serviceItem: {
    marginBottom: 20,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  serviceTime: {
    fontSize: 16,
    color: "#666",
  },
  staffContainer: {
    marginBottom: 20,
  },
  staffLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  staffInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  staffImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "500",
  },
  addServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  addServiceText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#2596be",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "600",
  },
  priceSubtext: {
    fontSize: 14,
    color: "#666",
  },
  continueButton: {
    backgroundColor: "#2596be",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  privacyText: {
    position: "absolute",
    bottom: 80,
    left: 15,
    right: 15,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  privacyLink: {
    color: "#2596be",
    textDecorationLine: "underline",
  },
});
