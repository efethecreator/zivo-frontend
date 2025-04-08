// app/business/appointments.tsx
"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import type { Appointment } from "../../types";

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    // Burada gerçek bir API çağrısı yapılacak
    // Şimdilik mock veri kullanıyoruz
    const mockAppointments: Appointment[] = [
      {
        id: 1,
        customerId: 101,
        customerName: "Ahmet Yılmaz",
        customerPhone: "555-123-4567",
        serviceId: 1,
        serviceName: "Saç Kesimi",
        staffId: 1,
        staffName: "Mehmet Usta",
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        duration: 30,
        status: "confirmed",
      },
      {
        id: 2,
        customerId: 102,
        customerName: "Ayşe Demir",
        customerPhone: "555-987-6543",
        serviceId: 2,
        serviceName: "Saç Boyama",
        staffId: 2,
        staffName: "Zeynep Hanım",
        date: new Date().toISOString().split("T")[0],
        time: "11:30",
        duration: 60,
        status: "pending",
      },
      {
        id: 3,
        customerId: 103,
        customerName: "Mustafa Kaya",
        customerPhone: "555-456-7890",
        serviceId: 3,
        serviceName: "Sakal Tıraşı",
        staffId: 1,
        staffName: "Mehmet Usta",
        date: new Date().toISOString().split("T")[0],
        time: "14:00",
        duration: 20,
        status: "confirmed",
      },
      {
        id: 4,
        customerId: 104,
        customerName: "Zeynep Aydın",
        customerPhone: "555-789-0123",
        serviceId: 4,
        serviceName: "Manikür",
        staffId: 3,
        staffName: "Ayşe Hanım",
        date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],
        time: "09:30",
        duration: 45,
        status: "confirmed",
      },
      {
        id: 5,
        customerId: 105,
        customerName: "Mehmet Öz",
        customerPhone: "555-234-5678",
        serviceId: 1,
        serviceName: "Saç Kesimi",
        staffId: 1,
        staffName: "Mehmet Usta",
        date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],
        time: "13:00",
        duration: 30,
        status: "cancelled",
      },
    ];

    setAppointments(mockAppointments);
  }, []);

  const getNextDays = (days: number) => {
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      result.push({
        date: date.toISOString().split("T")[0],
        day: date.getDate(),
        month: date.toLocaleString("default", { month: "short" }),
        weekday: date.toLocaleString("default", { weekday: "short" }),
      });
    }
    return result;
  };

  const nextDays = getNextDays(7);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.customerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus ? appointment.status === filterStatus : true;
    const matchesDate = appointment.date === selectedDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Onaylandı";
      case "pending":
        return "Bekliyor";
      case "cancelled":
        return "İptal";
      default:
        return status;
    }
  };

  if (!user || user.role !== "business") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Bu sayfayı görüntülemek için hizmet veren hesabı gereklidir.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Randevular</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Müşteri ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
        {nextDays.map((day) => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dateButton,
              selectedDate === day.date && styles.selectedDateButton,
            ]}
            onPress={() => setSelectedDate(day.date)}
          >
            <Text
              style={[
                styles.dateWeekday,
                selectedDate === day.date && styles.selectedDateText,
              ]}
            >
              {day.weekday}
            </Text>
            <Text
              style={[
                styles.dateDay,
                selectedDate === day.date && styles.selectedDateText,
              ]}
            >
              {day.day}
            </Text>
            <Text
              style={[
                styles.dateMonth,
                selectedDate === day.date && styles.selectedDateText,
              ]}
            >
              {day.month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statusFilter}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            filterStatus === null && styles.activeStatusButton,
          ]}
          onPress={() => setFilterStatus(null)}
        >
          <Text
            style={[
              styles.statusButtonText,
              filterStatus === null && styles.activeStatusButtonText,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusButton,
            filterStatus === "confirmed" && styles.activeStatusButton,
          ]}
          onPress={() => setFilterStatus("confirmed")}
        >
          <Text
            style={[
              styles.statusButtonText,
              filterStatus === "confirmed" && styles.activeStatusButtonText,
            ]}
          >
            Onaylı
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusButton,
            filterStatus === "pending" && styles.activeStatusButton,
          ]}
          onPress={() => setFilterStatus("pending")}
        >
          <Text
            style={[
              styles.statusButtonText,
              filterStatus === "pending" && styles.activeStatusButtonText,
            ]}
          >
            Bekleyen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusButton,
            filterStatus === "cancelled" && styles.activeStatusButton,
          ]}
          onPress={() => setFilterStatus("cancelled")}
        >
          <Text
            style={[
              styles.statusButtonText,
              filterStatus === "cancelled" && styles.activeStatusButtonText,
            ]}
          >
            İptal
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredAppointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            style={styles.appointmentCard}
            onPress={() => router.push(`/appointments/${appointment.id}`)}
          >
            <View style={styles.appointmentTime}>
              <Text style={styles.timeText}>{appointment.time}</Text>
              <Text style={styles.durationText}>{appointment.duration} dk</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.customerName}>{appointment.customerName}</Text>
              <Text style={styles.serviceName}>{appointment.serviceName}</Text>
              <Text style={styles.staffName}>
                <Ionicons name="person-outline" size={14} color="#666" /> {appointment.staffName}
              </Text>
            </View>
            <View style={styles.appointmentStatus}>
              <View
                style={[
                  styles.statusIndicator,
                  appointment.status === "confirmed"
                    ? styles.confirmedStatus
                    : appointment.status === "pending"
                    ? styles.pendingStatus
                    : styles.cancelledStatus,
                ]}
              />
              <Text style={styles.statusText}>
                {formatStatusText(appointment.status)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredAppointments.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Bu tarih için randevu bulunmuyor</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/appointments/new")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  dateSelector: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dateButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
  },
  selectedDateButton: {
    backgroundColor: "#1B9AAA",
  },
  dateWeekday: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  dateMonth: {
    fontSize: 12,
    color: "#666",
  },
  selectedDateText: {
    color: "#fff",
  },
  statusFilter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  activeStatusButton: {
    backgroundColor: "#1B9AAA",
  },
  statusButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activeStatusButtonText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentTime: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  durationText: {
    fontSize: 12,
    color: "#666",
  },
  appointmentDetails: {
    flex: 1,
    marginLeft: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  staffName: {
    fontSize: 14,
    color: "#666",
  },
  appointmentStatus: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  confirmedStatus: {
    backgroundColor: "#4CAF50",
  },
  pendingStatus: {
    backgroundColor: "#FFC107",
  },
  cancelledStatus: {
    backgroundColor: "#F44336",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1B9AAA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 100,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});