"use client";

import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getServiceById } from "../../services/service.service";
import { createAppointment } from "../../services/appointment.service";
import type { Service, Worker, BusinessShift } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { AxiosError } from "axios";
import { getWorkersByServiceId } from "../../services/worker.service";
import {
  getBusinessShifts,
  getShiftTimes,
} from "../../services/businessShift.service";

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

type CalendarDay = {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isSelectable: boolean;
};

const daysOfWeek = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];

// ISO datetime string'den saat kısmını çıkaran yardımcı fonksiyon
const extractTimeFromISOString = (isoString: string): string => {
  const date = new Date(isoString);
  return `${date.getUTCHours().toString().padStart(2, "0")}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
};

// generateCalendarDays fonksiyonunu dinamik hale getirelim
const generateCalendarDays = (
  businessShifts: BusinessShift[] = [],
  currentDate = new Date()
): CalendarDay[] => {
  const days: CalendarDay[] = [];

  // Ayın ilk gününü ve son gününü hesapla
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Ayın ilk gününün haftanın hangi günü olduğunu bul (0: Pazar, 1: Pazartesi, ...)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Önceki ayın son günlerini ekle
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    days.push({
      day,
      month: month,
      year,
      isCurrentMonth: false,
      isSelectable: false, // Önceki ay her zaman seçilemez
    });
  }

  // Mevcut ayın günlerini ekle
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(year, month, i);

    // JavaScript'te getDay() 0=Pazar, 1=Pazartesi, ... şeklinde döner
    // API'de ise 1=Pazartesi, ... 7=Pazar şeklinde
    // Bu yüzden dönüşüm yapmamız gerekiyor
    let dayOfWeek = date.getDay(); // 0=Pazar, 1=Pazartesi, ...
    if (dayOfWeek === 0) dayOfWeek = 7; // Pazar günü için 7'ye dönüştür

    // İşletmenin bu gün açık olup olmadığını kontrol et
    // Sadece aktif olan shift'leri kontrol et
    const isBusinessOpen = businessShifts.some(
      (shift) => shift.dayOfWeek === dayOfWeek && shift.isActive
    );

    // Bugünden önceki tarihleri seçilemez yap
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = date < today;

    days.push({
      day: i,
      month: month + 1,
      year,
      isCurrentMonth: true,
      isSelectable: isBusinessOpen && !isPastDate,
    });
  }

  // Sonraki ayın ilk günlerini ekle
  const daysNeeded = 42 - days.length; // 6 satır x 7 gün = 42 (tam bir takvim)
  for (let i = 1; i <= daysNeeded; i++) {
    days.push({
      day: i,
      month: month + 2,
      year,
      isCurrentMonth: false,
      isSelectable: false, // Sonraki ay her zaman seçilemez
    });
  }

  return days;
};

// Saat dilimlerini işletme saatlerine göre filtreleme fonksiyonu
const filterTimeSlotsByBusinessHours = (
  allTimeSlots: string[],
  businessShifts: BusinessShift[] = [],
  selectedDate: CalendarDay
): string[] => {
  if (!selectedDate || !businessShifts || businessShifts.length === 0) {
    return allTimeSlots; // Veri yoksa tüm saatleri göster
  }

  // Seçilen günün haftanın hangi günü olduğunu bul
  const date = new Date(
    selectedDate.year,
    selectedDate.month - 1,
    selectedDate.day
  );
  let dayOfWeek = date.getDay(); // 0=Pazar, 1=Pazartesi, ...
  if (dayOfWeek === 0) dayOfWeek = 7; // Pazar günü için 7'ye dönüştür

  // İşletmenin bu gün için çalışma saatlerini bul
  const businessHours = businessShifts.find(
    (shift) => shift.dayOfWeek === dayOfWeek && shift.isActive
  );

  if (!businessHours || !businessHours.shiftTime) {
    return []; // İşletme bu gün kapalıysa veya shiftTime yoksa boş dizi döndür
  }

  // Başlangıç ve bitiş saatlerini al
  const startTime = extractTimeFromISOString(businessHours.shiftTime.startTime);
  const endTime = extractTimeFromISOString(businessHours.shiftTime.endTime);

  // API'den gelen verilerde başlangıç ve bitiş saatleri ters olabilir, düzeltelim
  if (startTime > endTime) {
    // Eğer başlangıç saati bitiş saatinden büyükse, gece yarısını geçen bir çalışma saati olabilir
    // Bu durumda tüm saatleri göster ve sadece başlangıç saatinden küçük olanları filtrele
    console.log(
      `Fixing reversed times for day ${dayOfWeek}: ${startTime} - ${endTime}`
    );
    return allTimeSlots.filter((time) => {
      return time >= startTime || time < endTime;
    });
  }

  console.log(`Filtering time slots for day ${dayOfWeek}:`, {
    startTime,
    endTime,
  });

  // Saat dilimlerini filtrele
  return allTimeSlots.filter((time) => {
    return time >= startTime && time < endTime;
  });
};

// BookingScreen bileşeninde değişiklikler yapalım
export default function BookingScreen() {
  const { appointmentId } = useLocalSearchParams();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<CalendarDay | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ]);

  const { data: service, isLoading: isServiceLoading } = useQuery({
    queryKey: ["service", appointmentId],
    queryFn: () => getServiceById(appointmentId as string),
  });

  const { data: workers, isLoading: isWorkersLoading } = useQuery({
    queryKey: ["service-workers", service?.id],
    queryFn: () => getWorkersByServiceId(service?.id as string),
    enabled: !!service?.id,
  });

  // İşletmenin çalışma saatlerini al
  const { data: businessShifts, isLoading: isBusinessShiftsLoading } = useQuery(
    {
      queryKey: ["business-shifts", service?.businessId],
      queryFn: () => getBusinessShifts(service?.businessId as string),
      enabled: !!service?.businessId,
    }
  );

  // Tüm shift saatlerini al
  const { data: shiftTimes, isLoading: isShiftTimesLoading } = useQuery({
    queryKey: ["shift-times"],
    queryFn: async () => {
      try {
        return await getShiftTimes();
      } catch (err) {
        console.error("Shift time fetch failed:", err);
        throw err;
      }
    },
  });

  // Shift saatlerini yükle
  useEffect(() => {
    if (shiftTimes && shiftTimes.length > 0) {
      // API'den gelen shift saatlerini kullan
      const allSlots: string[] = [];

      shiftTimes.forEach((shiftTime: any) => {
        const start = extractTimeFromISOString(shiftTime.startTime);
        const end = extractTimeFromISOString(shiftTime.endTime);
        const slots = extractTimeSlotsFromShift(start, end);
        allSlots.push(...slots);
      });

      setTimeSlots(Array.from(new Set(allSlots)).sort());

      console.log("Loaded time slots from API:", setTimeSlots);
    }
  }, [shiftTimes]);

  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      Alert.alert("Success", "Appointment created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create appointment");
      console.error("Appointment creation error:", error);
    },
  });

  // Takvim günlerini hesapla
  const calendarDays = useMemo(() => {
    return generateCalendarDays(businessShifts || [], new Date());
  }, [businessShifts]);

  // Sayfa yüklendiğinde businessShifts verilerini kontrol et
  useEffect(() => {
    if (businessShifts) {
      console.log(
        "Business shifts data:",
        JSON.stringify(businessShifts, null, 2)
      );

      // Shift saatlerini kontrol et
      businessShifts.forEach((shift: any) => {
        if (shift.shiftTime) {
          const startTime = extractTimeFromISOString(shift.shiftTime.startTime);
          const endTime = extractTimeFromISOString(shift.shiftTime.endTime);
          console.log(
            `Day ${shift.dayOfWeek}: ${startTime} - ${endTime} (Active: ${shift.isActive})`
          );
        } else {
          console.warn(`Day ${shift.dayOfWeek}: No shift time data available`);
        }
      });
    }
  }, [businessShifts]);

  // Filtrelenmiş saat dilimleri
  const filteredTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return filterTimeSlotsByBusinessHours(
      timeSlots,
      businessShifts || [],
      selectedDate
    );
  }, [timeSlots, businessShifts, selectedDate]);

  // Sayfa yüklendiğinde ilk seçilebilir günü seç
  useEffect(() => {
    if (calendarDays && calendarDays.length > 0) {
      const firstSelectableDay = calendarDays.find((day) => day.isSelectable);
      if (firstSelectableDay) {
        setSelectedDate(firstSelectableDay);
      }
    }
  }, [calendarDays]);

  // Tarih değiştiğinde ilk geçerli saati seç
  useEffect(() => {
    if (filteredTimeSlots && filteredTimeSlots.length > 0) {
      setSelectedTime(filteredTimeSlots[0]);
    } else {
      setSelectedTime(null);
    }
  }, [filteredTimeSlots]);

  const handleServiceSelect = (service: Service) => {
    setSelectedServices((prev) => {
      const isAlreadySelected = prev.some((s) => s.id === service.id);
      if (isAlreadySelected) {
        return prev.filter((s) => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      const price =
        typeof service.price === "string"
          ? Number.parseFloat(service.price)
          : service.price;
      return total + price;
    }, 0);
  };

  const calculateTotalDuration = () => {
    if (!selectedServices || selectedServices.length === 0) return 0;
    return selectedServices.reduce((total, service) => {
      const duration = service.durationMinutes || 0;
      return total + duration;
    }, 0);
  };

  const handleContinue = async () => {
    if (
      !service ||
      !user ||
      selectedServices.length === 0 ||
      !selectedWorker ||
      !selectedDate ||
      !selectedTime
    )
      return;

    try {
      const appointmentTime = new Date(
        selectedDate.year,
        selectedDate.month - 1,
        selectedDate.day,
        Number.parseInt(selectedTime.split(":")[0]),
        Number.parseInt(selectedTime.split(":")[1])
      ).toISOString();

      const appointmentData = {
        businessId: service.businessId,
        workerId: selectedWorker.id,
        appointmentTime,
        totalPrice: calculateTotalPrice(),
        services: selectedServices.map((service) => ({
          serviceId: service.id,
          price:
            typeof service.price === "string"
              ? Number.parseFloat(service.price)
              : service.price,
          duration: service.durationMinutes || 30,
        })),
      };

      console.log(
        "Creating appointment with data:",
        JSON.stringify(appointmentData, null, 2)
      );

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

  if (
    isServiceLoading ||
    isWorkersLoading ||
    isBusinessShiftsLoading ||
    isShiftTimesLoading ||
    !service
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2596be" />
      </View>
    );
  }
  // Mevcut ayın adını ve yılını al
  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
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
          <Text style={styles.monthTitle}>
            {currentMonthName} {currentYear}
          </Text>

          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day, index) => (
              <Text key={index} style={styles.dayOfWeekText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <View key={index} style={styles.calendarDayContainer}>
                <TouchableOpacity
                  style={[
                    styles.calendarDayButton,
                    !day.isSelectable && styles.disabledDayButton,
                  ]}
                  onPress={() => day.isSelectable && setSelectedDate(day)}
                  disabled={!day.isSelectable}
                >
                  <View
                    style={[
                      styles.calendarDayInner,
                      selectedDate?.day === day.day &&
                      selectedDate?.month === day.month &&
                      selectedDate?.year === day.year
                        ? styles.selectedDayInner
                        : {},
                      !day.isCurrentMonth ? styles.otherMonthDay : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        !day.isCurrentMonth ? styles.otherMonthDayText : {},
                        !day.isSelectable && day.isCurrentMonth
                          ? styles.disabledDayText
                          : {},
                        selectedDate?.day === day.day &&
                        selectedDate?.month === day.month &&
                        selectedDate?.year === day.year
                          ? styles.selectedDayText
                          : {},
                      ]}
                    >
                      {day.day}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.timeSlotsContainer}>
          {filteredTimeSlots.length === 0 ? (
            <Text style={styles.noTimeSlotsText}>
              No available time slots for selected date
            </Text>
          ) : (
            filteredTimeSlots.map((time, index) => (
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
            ))
          )}
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
                <Text style={styles.workerName}>{`${
                  worker.firstName + " " + worker.lastName
                }`}</Text>
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
              selectedServices.some((s) => s.id === service.id) &&
                styles.selectedService,
            ]}
            onPress={() => handleServiceSelect(service)}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDuration}>
                {service.durationMinutes} min
              </Text>
            </View>
            <Text style={styles.servicePrice}>€{service.price}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            €{calculateTotalPrice().toFixed(2)}
          </Text>
          <Text style={styles.priceSubtext}>
            {calculateTotalDuration()} min
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedServices.length === 0 ||
              !selectedWorker ||
              !selectedDate ||
              !selectedTime) &&
              styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={
            createAppointmentMutation.isPending ||
            selectedServices.length === 0 ||
            !selectedWorker ||
            !selectedDate ||
            !selectedTime
          }
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

// Stilleri güncelleyelim
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
    fontSize: 23,
    fontWeight: "600",
    marginLeft: 15,
    fontFamily: "Outfit-Bold",
  },
  scrollContent: {
    paddingBottom: 70,
  },
  calendarContainer: {
    padding: 15,
    backgroundColor: "#fff",
  },
  monthTitle: {
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 15,
    fontFamily: "Outfit-Bold",
  },
  daysOfWeekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayOfWeekText: {
    width: "14.28%",
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    fontFamily: "Outfit-Regular",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDayContainer: {
    width: "14.28%",
    aspectRatio: 1,
    padding: 2,
  },
  calendarDayButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarDayInner: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  selectedDayInner: {
    backgroundColor: "#2596be",
  },
  disabledDayButton: {
    opacity: 0.5,
  },
  calendarDayText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    fontFamily: "Outfit-Regular",
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthDayText: {
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
  disabledDayText: {
    color: "#ccc",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Outfit-Bold",
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
    fontFamily: "Outfit-Bold",
  },
  disabledTimeSlot: {
    backgroundColor: "#f0f0f0",
    opacity: 0.5,
  },
  disabledTimeSlotText: {
    color: "#ccc",
    fontFamily: "Outfit-Regular",
  },
  selectedTimeSlot: {
    backgroundColor: "#2596be",
  },
  selectedTimeSlotText: {
    color: "#fff",
    fontFamily: "Outfit-Bold",
  },
  workerSelectionContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    fontFamily: "Outfit-Bold",
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
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Bold",
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2596be",
    fontFamily: "Outfit-Bold",
  },
  bottomBar: {
    position: "absolute",
    bottom: 23,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderRadius: 10,
    marginHorizontal: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Outfit-Bold",
  },
  priceSubtext: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Outfit-Light",
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
    fontFamily: "Outfit-Bold",
  },
  noTimeSlotsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
    width: "100%",
    fontFamily: "Outfit-Regular",
  },
  debugContainer: {
    display: "none", // Debug bilgilerini gizle
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "Outfit-Bold",
  },
  debugText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontFamily: "Outfit-Light",
  },
});
