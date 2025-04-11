// app/business/appointments/new.tsx
"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../../context/AuthContext"
import type { Service, Staff } from "../../../types"

export default function NewAppointmentScreen() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)

  useEffect(() => {
    // Burada gerçek bir API çağrısı yapılacak
    // Şimdilik mock veri kullanıyoruz
    const mockServices: Service[] = [
      {
        id: 1,
        name: "Haircut",
        description: "Professional haircut",
        price: 100,
        duration: 30,
        category: "Hair",
      },
      {
        id: 2,
        name: "Hair Coloring",
        description: "Professional hair coloring",
        price: 200,
        duration: 60,
        category: "Hair",
      },
      {
        id: 3,
        name: "Beard Shaping",
        description: "Professional beard shaping",
        price: 50,
        duration: 20,
        category: "Beard",
      },
      {
        id: 4,
        name: "Nail Care",
        description: "Professional nail care",
        price: 80,
        duration: 45,
        category: "Nail",
      },
    ]

    const mockStaff: Staff[] = [
      {
        id: 1,
        name: "Mehmet Usta",
        position: "Barber",
        services: [1, 3],
      },
      {
        id: 2,
        name: "Zeynep Hanım",
        position: "Hair Stylist",
        services: [1, 2],
      },
      {
        id: 3,
        name: "Ayşe Hanım",
        position: "Nail Technician",
        services: [4],
      },
    ]

    setServices(mockServices)
    setStaff(mockStaff)
  }, [])

  const handleCreateAppointment = () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      alert("Please fill in all required fields.")
      return
    }

    // Burada randevu oluşturma işlemi yapılacak
    alert("Appointment created successfully!")
    router.back()
  }

  const getAvailableStaff = () => {
    if (!selectedService) return staff
    return staff.filter((s) => s.services.includes(selectedService.id))
  }

  // Tarih seçenekleri için 7 günlük bir liste oluştur
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    }
  })

  // Saat seçenekleri
  const timeOptions = [
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
  ]

  if (!user || user.role !== "business") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>A service provider account is required to view this page.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/auth/login")}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Appointment</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service Information</Text>
        </View>

        <TouchableOpacity style={styles.selectButton} onPress={() => setShowServiceModal(true)}>
          <Text style={styles.selectButtonLabel}>Service</Text>
          <Text style={styles.selectButtonValue}>{selectedService ? selectedService.name : "Select service"}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowStaffModal(true)}
          disabled={!selectedService}
        >
          <Text style={styles.selectButtonLabel}>Staff</Text>
          <Text style={[styles.selectButtonValue, !selectedService && styles.disabledText]}>
            {selectedStaff ? selectedStaff.name : !selectedService ? "Select service first" : "Select staff"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Appointment Time</Text>
        </View>

        <TouchableOpacity style={styles.selectButton} onPress={() => setShowDateModal(true)}>
          <Text style={styles.selectButtonLabel}>Date</Text>
          <Text style={styles.selectButtonValue}>
            {selectedDate
              ? new Date(selectedDate).toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Select date"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.selectButton} onPress={() => setShowTimeModal(true)} disabled={!selectedDate}>
          <Text style={styles.selectButtonLabel}>Time</Text>
          <Text style={[styles.selectButtonValue, !selectedDate && styles.disabledText]}>
            {selectedTime ? selectedTime : !selectedDate ? "Select date first" : "Select time"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter customer name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateAppointment}>
        <Text style={styles.createButtonText}>Create Appointment</Text>
      </TouchableOpacity>

      {/* Hizmet Seçim Modalı */}
      <Modal
        visible={showServiceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service</Text>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedService(service)
                    setSelectedStaff(null)
                    setShowServiceModal(false)
                  }}
                >
                  <View>
                    <Text style={styles.modalItemTitle}>{service.name}</Text>
                    <Text style={styles.modalItemSubtitle}>
                      {service.duration} dk • {service.price} ₺
                    </Text>
                  </View>
                  {selectedService?.id === service.id && <Ionicons name="checkmark" size={24} color="#1B9AAA" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Personel Seçim Modalı */}
      <Modal
        visible={showStaffModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStaffModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Staff</Text>
              <TouchableOpacity onPress={() => setShowStaffModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {getAvailableStaff().map((staffMember) => (
                <TouchableOpacity
                  key={staffMember.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedStaff(staffMember)
                    setShowStaffModal(false)
                  }}
                >
                  <View>
                    <Text style={styles.modalItemTitle}>{staffMember.name}</Text>
                    <Text style={styles.modalItemSubtitle}>{staffMember.position}</Text>
                  </View>
                  {selectedStaff?.id === staffMember.id && <Ionicons name="checkmark" size={24} color="#1B9AAA" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Tarih Seçim Modalı */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {dateOptions.map((dateOption) => (
                <TouchableOpacity
                  key={dateOption.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDate(dateOption.value)
                    setShowDateModal(false)
                  }}
                >
                  <Text style={styles.modalItemTitle}>{dateOption.label}</Text>
                  {selectedDate === dateOption.value && <Ionicons name="checkmark" size={24} color="#1B9AAA" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Saat Seçim Modalı */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saat Seçin</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.timeGrid}>
                {timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeOption, selectedTime === time && styles.selectedTimeOption]}
                    onPress={() => {
                      setSelectedTime(time)
                      setShowTimeModal(false)
                    }}
                  >
                    <Text style={[styles.timeOptionText, selectedTime === time && styles.selectedTimeOptionText]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  selectButtonLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  selectButtonValue: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  disabledText: {
    color: "#999",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 15,
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeOption: {
    width: "30%",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedTimeOption: {
    backgroundColor: "#1B9AAA",
  },
  timeOptionText: {
    fontSize: 14,
    color: "#666",
  },
  selectedTimeOptionText: {
    color: "#fff",
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
