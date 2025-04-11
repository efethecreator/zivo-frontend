// app/business/dashboard.tsx
"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import type { Appointment } from "../../types"

export default function BusinessDashboardScreen() {
  const { user } = useAuth()
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    todayCount: 0,
    weekCount: 0,
    monthRevenue: 0,
  })

  useEffect(() => {
    // Burada gerçek bir API çağrısı yapılacak
    // Şimdilik mock veri kullanıyoruz
    const mockAppointments: Appointment[] = [
      {
        id: 1,
        customerId: 101,
        customerName: "Murat Efe Çetin",
        customerPhone: "555-123-4567",
        serviceId: 1,
        serviceName: "Haircut",
        staffId: 1,
        staffName: "Murat Efe Çetin",
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        duration: 30,
        status: "confirmed",
      },
      {
        id: 2,
        customerId: 102,
        customerName: "Taha Zeytun",
        customerPhone: "555-987-6543",
        serviceId: 2,
        serviceName: "Hair Coloring",
        staffId: 2,
        staffName: "Taha Zeytun",
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
        serviceName: "Beard Shave",
        staffId: 1,
        staffName: "Mehmet Usta",
        date: new Date().toISOString().split("T")[0],
        time: "14:00",
        duration: 20,
        status: "confirmed",
      },
    ]

    setTodayAppointments(mockAppointments)
    setStats({
      todayCount: mockAppointments.length,
      weekCount: 15,
      monthRevenue: 2850,
    })
  }, [])

  // Yükleme durumu
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Kullanıcı bilgilerinin yüklenmesi için kısa bir gecikme
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>You need to sign in.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/auth/login")}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (user.role !== "business") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>A service provider account is required to view this page.</Text>
        <Text style={styles.debugText}>Current role: {user.role || "tanımlanmamış"}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/auth/login")}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.businessName}>{user.business?.name || "My Business"}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.todayCount}</Text>
            <Text style={styles.statLabel}>Today's Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.weekCount}</Text>
            <Text style={styles.statLabel}>This Week's Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.monthRevenue} ₺</Text>
            <Text style={styles.statLabel}>Monthly Revenue</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          <TouchableOpacity onPress={() => router.push("/business/appointments")}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {todayAppointments.length > 0 ? (
          todayAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTime}>
                <Text style={styles.timeText}>{appointment.time}</Text>
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
                  {appointment.status === "confirmed"
                    ? "Confirmed"
                    : appointment.status === "pending"
                      ? "Pending"
                      : "Cancelled"}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No appointments for today</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/business/appointments/new")}>
            <Ionicons name="calendar-outline" size={24} color="#1B9AAA" />
            <Text style={styles.quickActionText}>Add Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/business/services")}>
            <Ionicons name="list-outline" size={24} color="#1B9AAA" />
            <Text style={styles.quickActionText}>Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/business/staff")}>
            <Ionicons name="people-outline" size={24} color="#1B9AAA" />
            <Text style={styles.quickActionText}>Staff</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/business/customers")}>
            <Ionicons name="person-outline" size={24} color="#1B9AAA" />
            <Text style={styles.quickActionText}>Customers</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  businessName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B9AAA",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
    color: "#1B9AAA",
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
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  quickActionButton: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  quickActionText: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 100,
  },
  debugText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
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
})
