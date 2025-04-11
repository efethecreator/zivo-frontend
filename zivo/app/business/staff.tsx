// app/business/staff.tsx
"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import type { Staff, Service } from "../../types"

export default function BusinessStaffScreen() {
  const { user } = useAuth()
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Form state
  const [staffName, setStaffName] = useState("")
  const [staffPosition, setStaffPosition] = useState("")
  const [selectedServices, setSelectedServices] = useState<number[]>([])

  useEffect(() => {
    // Burada gerçek bir API çağrısı yapılacak
    // Şimdilik mock veri kullanıyoruz
    const mockStaff: Staff[] = [
      {
        id: 1,
        name: "Murat Efe Çetin",
        position: "Barber",
        services: [1, 3],
      },
      {
        id: 2,
        name: "Taha Zeytun",
        position: "Hair Stylist",
        services: [1, 2],
      },
      {
        id: 3,
        name: "Ayşe Hanım",
        position: "Colorist",
        services: [4],
      },
    ]

    const mockServices: Service[] = [
      {
        id: 1,
        name: "Haircut",
        price: 100,
        duration: 30,
        category: "Hair",
      },
      {
        id: 2,
        name: "Hair Coloring",
        price: 200,
        duration: 60,
        category: "Hair",
      },
      {
        id: 3,
        name: "Beard Trim",
        price: 50,
        duration: 20,
        category: "Beard",
      },
      {
        id: 4,
        name: "Manicure",
        price: 80,
        duration: 45,
        category: "Nails",
      },
    ]

    setStaff(mockStaff)
    setServices(mockServices)
  }, [])

  const handleAddStaff = () => {
    if (!staffName || !staffPosition || selectedServices.length === 0) return

    const newStaff: Staff = {
      id: staff.length + 1,
      name: staffName,
      position: staffPosition,
      services: selectedServices,
    }

    if (editingStaff) {
      // Güncelleme
      setStaff(staff.map((s) => (s.id === editingStaff.id ? { ...newStaff, id: s.id } : s)))
    } else {
      // Yeni ekleme
      setStaff([...staff, newStaff])
    }

    resetForm()
    setModalVisible(false)
  }

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setStaffName(staffMember.name)
    setStaffPosition(staffMember.position)
    setSelectedServices(staffMember.services)
    setModalVisible(true)
  }

  const handleDeleteStaff = (id: number) => {
    setStaff(staff.filter((s) => s.id !== id))
  }

  const resetForm = () => {
    setEditingStaff(null)
    setStaffName("")
    setStaffPosition("")
    setSelectedServices([])
  }

  const toggleService = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId))
    } else {
      setSelectedServices([...selectedServices, serviceId])
    }
  }

  const getServiceNames = (serviceIds: number[]) => {
    return serviceIds
      .map((id) => services.find((service) => service.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  const filteredStaff = staff.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
        <Text style={styles.headerTitle}>Staff</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholderTextColor={"#8888"}
            placeholder="Search staff..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredStaff.map((staffMember) => (
          <View key={staffMember.id} style={styles.staffCard}>
            <View style={styles.staffAvatar}>
              <Text style={styles.avatarText}>{staffMember.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.staffInfo}>
              <Text style={styles.staffName}>{staffMember.name}</Text>
              <Text style={styles.staffPosition}>{staffMember.position}</Text>
              <Text style={styles.staffServices}>{getServiceNames(staffMember.services)}</Text>
            </View>
            <View style={styles.staffActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEditStaff(staffMember)}>
                <Ionicons name="create-outline" size={20} color="#1B9AAA" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteStaff(staffMember.id)}>
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredStaff.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No staff found</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm()
          setModalVisible(true)
        }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingStaff ? "Edit Staff" : "Add New Staff"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Staff Name *</Text>
                <TextInput
                  style={styles.input}
                  value={staffName}
                  onChangeText={setStaffName}
                  placeholder="Personel adını girin"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Position *</Text>
                <TextInput
                  style={styles.input}
                  value={staffPosition}
                  onChangeText={setStaffPosition}
                  placeholder="Pozisyon girin"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Services Offered *</Text>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceCheckbox,
                      selectedServices.includes(service.id) && styles.serviceCheckboxSelected,
                    ]}
                    onPress={() => toggleService(service.id)}
                  >
                    <View style={[styles.checkbox, selectedServices.includes(service.id) && styles.checkboxSelected]}>
                      {selectedServices.includes(service.id) && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                    <Text style={styles.serviceCheckboxText}>{service.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleAddStaff}>
                <Text style={styles.saveButtonText}>{editingStaff ? "Update" : "Add"}</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  staffCard: {
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
  staffAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1B9AAA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  staffPosition: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  staffServices: {
    fontSize: 14,
    color: "#666",
  },
  staffActions: {
    justifyContent: "space-around",
    paddingLeft: 15,
  },
  editButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
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
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#1B9AAA",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  serviceCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  serviceCheckboxSelected: {
    backgroundColor: "#f9f9f9",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1B9AAA",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#1B9AAA",
  },
  serviceCheckboxText: {
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#1B9AAA",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 100,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
