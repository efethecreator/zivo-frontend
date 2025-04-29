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
import { getBusinessWorkers } from "../../services/worker.service";
import { createAppointment } from "../../services/appointment.service";
import { Service, Worker } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { AxiosError } from 'axios';

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

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

export default function BookingScreen() {
  const { appointmentId } = useLocalSearchParams();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<CalendarDay>({
    day: 11,
    month: 4,
    year: 2025,
    isCurrentMonth: true,
  });
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const { data: service, isLoading: isServiceLoading } = useQuery({
    queryKey: ['service', appointmentId],
    queryFn: () => getServiceById(appointmentId as string),
  });

  const { data: workers, isLoading: isWorkersLoading } = useQuery({
    queryKey: ['workers', service?.businessId],
    queryFn: () => getBusinessWorkers(service?.businessId as string),
    enabled: !!service?.businessId,
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

  const handleServiceSelect = (service: Service) => {
    setSelectedServices(prev => {
      const isAlreadySelected = prev.some(s => s.id === service.id);
      if (isAlreadySelected) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
      return total + price;
    }, 0);
  };

  const handleContinue = async () => {
    if (!service || !user || selectedServices.length === 0 || !selectedWorker) return;

    try {
      const appointmentTime = new Date(
        selectedDate.year,
        selectedDate.month - 1,
        selectedDate.day,
        parseInt(selectedTime.split(":")[0]),
        parseInt(selectedTime.split(":")[1])
      ).toISOString();

      const appointmentData = {
        businessId: service.businessId,
        workerId: selectedWorker.id,
        appointmentTime,
        totalPrice: calculateTotalPrice(),
        services: selectedServices.map(service => ({
          serviceId: service.id,
          price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
          duration: 30,
        })),
      };

      console.log("Creating appointment with data:", JSON.stringify(appointmentData, null, 2));

      await createAppointmentMutation.mutateAsync(appointmentData);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("Error response:", error.response.data);
      }
      Alert.alert(
        "Error", 
        "Failed to create appointment. Please check the console for details."
      );
    }
  };

  if (isServiceLoading || isWorkersLoading || !service) {
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

        {/* Worker Selection */}
        <View style={styles.workerSelectionContainer}>
          <Text style={styles.sectionTitle}>Select Worker</Text>
          {workers?.map((worker) => (
            <TouchableOpacity
              key={worker.id}
              style={[
                styles.workerItem,
                selectedWorker?.id === worker.id && styles.selectedWorker,
              ]}
              onPress={() => setSelectedWorker(worker)}
            >
              <View style={styles.workerImagePlaceholder}>
                <Ionicons name="person" size={24} color="#666" />
              </View>
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{`${worker.firstName} ${worker.lastName}`}</Text>
              </View>
            </TouchableOpacity>
          ))}
          </View>

        {/* Service Selection */}
        <View style={styles.serviceSelectionContainer}>
          <Text style={styles.sectionTitle}>Select Services</Text>
          <TouchableOpacity
            style={[
              styles.serviceItem,
              selectedServices.some(s => s.id === service.id) && styles.selectedService
            ]}
            onPress={() => handleServiceSelect(service)}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDuration}>{service.duration} min</Text>
            </View>
            <Text style={styles.servicePrice}>€{service.price}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>€{calculateTotalPrice().toFixed(2)}</Text>
          <Text style={styles.priceSubtext}>
            {selectedServices.reduce((total, service) => total + service.duration, 0)} min
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            (selectedServices.length === 0 || !selectedWorker) && styles.disabledButton
          ]} 
          onPress={handleContinue}
          disabled={createAppointmentMutation.isPending || selectedServices.length === 0 || !selectedWorker}
        >
          {createAppointmentMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
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
  workerSelectionContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  workerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedWorker: {
    backgroundColor: "#e6f2f7",
    borderColor: "#2596be",
    borderWidth: 1,
  },
  workerImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  serviceSelectionContainer: {
    padding: 15,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedService: {
    backgroundColor: "#e6f2f7",
    borderColor: "#2596be",
    borderWidth: 1,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
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
  disabledButton: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
