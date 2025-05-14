// booking/[appointmentId]/reschedule.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAppointmentById,
  rescheduleAppointment,
} from "../../../services/appointment.service";
import {
  getBusinessShifts,
  getShiftTimes,
} from "../../../services/businessShift.service";
import { getServiceById } from "../../../services/service.service";
import Toast from "react-native-toast-message";
import { AnimatedHeader } from "../../../components/AnimatedHeader";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CELL_SIZE = width / 7 - 8;

const extractTimeFromISOString = (iso: string) => {
  const date = new Date(iso);
  return `${date.getUTCHours().toString().padStart(2, "0")}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const extractTimeSlotsFromShift = (start: string, end: string): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  for (let t = startTotal; t < endTotal; t += 30) {
    const hour = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const min = (t % 60).toString().padStart(2, "0");
    slots.push(`${hour}:${min}`);
  }
  return slots;
};

const generateCalendarDays = (
  businessShifts = [],
  currentDate = new Date()
) => {
  const days = [];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      month,
      year,
      isCurrentMonth: false,
      isSelectable: false,
    });
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(year, month, i);
    let dayOfWeek = date.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;
    const isBusinessOpen = businessShifts.some(
      (shift) => shift.dayOfWeek === dayOfWeek && shift.isActive
    );
    const isPast = date < new Date();
    days.push({
      day: i,
      month: month + 1,
      year,
      isCurrentMonth: true,
      isSelectable: isBusinessOpen && !isPast,
    });
  }

  const daysNeeded = 42 - days.length;
  for (let i = 1; i <= daysNeeded; i++) {
    days.push({
      day: i,
      month: month + 2,
      year,
      isCurrentMonth: false,
      isSelectable: false,
    });
  }
  return days;
};

// Weekday labels
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RescheduleScreen = () => {
  const { appointmentId } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [serviceNames, setServiceNames] = useState([]);
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const { data: appointment, isLoading: isAppointmentLoading } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId),
  });

  // Fetch service details for each service in the appointment
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (appointment?.services && appointment.services.length > 0) {
        try {
          const servicePromises = appointment.services.map((service) =>
            getServiceById(service.serviceId)
          );
          const servicesData = await Promise.all(servicePromises);
          setServiceNames(servicesData.map((service) => service.name));
        } catch (error) {
          console.error("Error fetching service details:", error);
        }
      }
    };

    if (appointment) {
      fetchServiceDetails();
    }
  }, [appointment]);

  const { data: businessShifts } = useQuery({
    queryKey: ["shifts", appointment?.businessId],
    queryFn: () => getBusinessShifts(appointment?.businessId),
    enabled: !!appointment?.businessId,
  });

  const { data: shiftTimes } = useQuery({
    queryKey: ["shift-times"],
    queryFn: getShiftTimes,
  });

  useEffect(() => {
    if (shiftTimes?.length) {
      const allSlots = [];
      shiftTimes.forEach((st) => {
        const start = extractTimeFromISOString(st.startTime);
        const end = extractTimeFromISOString(st.endTime);
        allSlots.push(...extractTimeSlotsFromShift(start, end));
      });
      setTimeSlots(Array.from(new Set(allSlots)).sort());
    }
  }, [shiftTimes]);

  const calendarDays = useMemo(
    () => generateCalendarDays(businessShifts, currentMonth),
    [businessShifts, currentMonth]
  );

  const filteredTimeSlots = useMemo(() => {
    if (!selectedDate || !businessShifts) return [];
    const date = new Date(
      selectedDate.year,
      selectedDate.month - 1,
      selectedDate.day
    );
    let dayOfWeek = date.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;
    const shift = businessShifts.find(
      (s) => s.dayOfWeek === dayOfWeek && s.isActive
    );
    if (!shift || !shift.shiftTime) return [];
    const start = extractTimeFromISOString(shift.shiftTime.startTime);
    const end = extractTimeFromISOString(shift.shiftTime.endTime);
    return timeSlots.filter((t) =>
      start < end ? t >= start && t < end : t >= start || t < end
    );
  }, [selectedDate, businessShifts, timeSlots]);

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, appointmentTime }) =>
      rescheduleAppointment(id, appointmentTime),

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Appointment rescheduled",
        text2: "Your appointment has been successfully rescheduled",
      });
      router.replace("/(tabs)/appointments");
    },

    onError: (err) => {
      console.error("Reschedule error", err);
      Alert.alert("Error", "Could not reschedule. Please try again.");
    },
  });

  const handleReschedule = () => {
    if (!appointment || !selectedDate || !selectedTime) return;
    const newDate = new Date(
      Date.UTC(
        selectedDate.year,
        selectedDate.month - 1,
        selectedDate.day,
        Number.parseInt(selectedTime.split(":")[0]),
        Number.parseInt(selectedTime.split(":")[1])
      )
    ).toISOString();

    rescheduleMutation.mutate({ id: appointment.id, appointmentTime: newDate });
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (isAppointmentLoading || !appointment) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <AnimatedHeader title="Reschedule" onBack={() => router.back()} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2596be" />
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format price safely
  const formattedPrice =
    typeof appointment.totalPrice === "number"
      ? `$${appointment.totalPrice.toFixed(2)}`
      : "Price not available";

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedHeader
        title="Reschedule Appointment"
        onBack={() => router.back()}
        scrollY={scrollY}
      />

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select New Date</Text>

          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={styles.monthNavButton}
            >
              <Ionicons name="chevron-back" size={24} color="#2596be" />
            </TouchableOpacity>

            <Text style={styles.monthYearText}>
              {formatMonthYear(currentMonth)}
            </Text>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={styles.monthNavButton}
            >
              <Ionicons name="chevron-forward" size={24} color="#2596be" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayHeader}>
            {WEEKDAYS.map((day, index) => (
              <Text key={index} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => day.isSelectable && setSelectedDate(day)}
                style={[
                  styles.calendarCell,
                  day.isCurrentMonth
                    ? styles.currentMonthCell
                    : styles.otherMonthCell,
                  selectedDate?.day === day.day &&
                    selectedDate?.month === day.month &&
                    styles.selectedDateCell,
                  !day.isSelectable && styles.disabledCell,
                ]}
                disabled={!day.isSelectable}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !day.isCurrentMonth && styles.otherMonthText,
                    selectedDate?.day === day.day &&
                      selectedDate?.month === day.month &&
                      styles.selectedDateText,
                    !day.isSelectable && styles.disabledText,
                  ]}
                >
                  {day.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select New Time</Text>

          {selectedDate ? (
            filteredTimeSlots.length > 0 ? (
              <View style={styles.timeSlotGrid}>
                {filteredTimeSlots.map((slot, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedTime(slot)}
                    style={[
                      styles.timeSlot,
                      selectedTime === slot && styles.selectedTimeSlot,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTime === slot && styles.selectedTimeSlotText,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noTimesContainer}>
                <Ionicons name="time-outline" size={40} color="#ccc" />
                <Text style={styles.noTimesText}>
                  No available time slots for this date
                </Text>
              </View>
            )
          ) : (
            <View style={styles.noTimesContainer}>
              <Ionicons name="calendar-outline" size={40} color="#ccc" />
              <Text style={styles.noTimesText}>Please select a date first</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.rescheduleButton,
            (!selectedDate || !selectedTime) && styles.disabledButton,
          ]}
          disabled={
            !selectedDate || !selectedTime || rescheduleMutation.isPending
          }
          onPress={handleReschedule}
        >
          {rescheduleMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.rescheduleButtonText}>Confirm Reschedule</Text>
          )}
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
    fontFamily: "Outfit-Bold",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Outfit-Bold",
  },
  weekdayHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekdayText: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    fontFamily: "Outfit-Bold",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  calendarCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: "center",
    alignItems: "center",
    margin: 3,
    borderRadius: 8,
  },
  currentMonthCell: {
    backgroundColor: "#f5f5f5",
  },
  otherMonthCell: {
    backgroundColor: "#eaeaea",
  },
  selectedDateCell: {
    backgroundColor: "#2596be",
  },
  disabledCell: {
    opacity: 0.5,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    fontFamily: "Outfit-Regular",
  },
  otherMonthText: {
    color: "#aaa",
    fontFamily: "Outfit-Regular",
  },
  selectedDateText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Outfit-Bold",
  },
  disabledText: {
    color: "#bbb",
    fontFamily: "Outfit-Regular",
  },
  timeSlotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    margin: 6,
    minWidth: 80,
    alignItems: "center",
  },
  selectedTimeSlot: {
    backgroundColor: "#2596be",
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    fontFamily: "Outfit-Regular",
  },
  selectedTimeSlotText: {
    color: "#fff",
  },
  noTimesContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  noTimesText: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    fontFamily: "Outfit-Regular",
  },
  rescheduleButton: {
    backgroundColor: "#2596be",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#b0d4e3",
  },
  rescheduleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Outfit-Bold",
  },
});

export default RescheduleScreen;
