// app/business/services.tsx
"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  SafeAreaView, // <-- iOS çentikli ekranlarda uyumluluk için
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import type { Service } from "../../types";

export default function BusinessServicesScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Form state
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");

  useEffect(() => {
    // Burada gerçek bir API çağrısı yapılabilir, şimdilik mock veri kullanılıyor
    const mockServices: Service[] = [
      {
        id: 1,
        name: "Haircut",
        description: "Professional haircut",
        price: 100,
        duration: 30,
        category: "Haircut",
      },
      {
        id: 2,
        name: "Hair Coloring",
        description: "Professional hair coloring",
        price: 200,
        duration: 60,
        category: "Haircut",
      },
      {
        id: 3,
        name: "Beard Trim",
        description: "Professional beard trim",
        price: 50,
        duration: 20,
        category: "Beard",
      },
      {
        id: 4,
        name: "Manicure",
        description: "Nail care and polish",
        price: 80,
        duration: 45,
        category: "Nail",
      },
    ];

    setServices(mockServices);

    // Kategorileri çıkar (tekrarsız liste)
    const uniqueCategories = Array.from(
      new Set(mockServices.map((service) => service.category))
    ).filter((cat): cat is string => cat !== undefined);

    setCategories(uniqueCategories);
  }, []);

  const handleAddService = () => {
    if (!serviceName || !servicePrice || !serviceDuration) return;

    const newService: Service = {
      id: services.length + 1,
      name: serviceName,
      description: serviceDescription,
      price: Number(servicePrice),
      duration: Number(serviceDuration),
      category: serviceCategory,
    };

    if (editingService) {
      // Güncelleme
      setServices(
        services.map((s) =>
          s.id === editingService.id ? { ...newService, id: s.id } : s
        )
      );
    } else {
      // Yeni ekleme
      setServices([...services, newService]);
    }

    resetForm();
    setModalVisible(false);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description || "");
    setServicePrice(service.price.toString());
    setServiceDuration(service.duration.toString());
    setServiceCategory(service.category || "");
    setModalVisible(true);
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const resetForm = () => {
    setEditingService(null);
    setServiceName("");
    setServiceDescription("");
    setServicePrice("");
    setServiceDuration("");
    setServiceCategory("");
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory
      ? service.category === filterCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  if (!user || user.role !== "business") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>
            A service provider account is required to view this page.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/auth/login")}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Services</Text>
        </View>

        {/* TOP BAR: Search + Category Filter */}
        <View style={styles.topBarContainer}>
          {/* SEARCH */}
          <View style={styles.searchSection}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholderTextColor="#888"
                placeholder="Search service..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* CATEGORY FILTER (Yatay Scroll) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                filterCategory === null && styles.activeCategoryButton,
              ]}
              onPress={() => setFilterCategory(null)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  filterCategory === null && styles.activeCategoryButtonText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  filterCategory === category && styles.activeCategoryButton,
                ]}
                onPress={() => setFilterCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    filterCategory === category && styles.activeCategoryButtonText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SERVICE LIST */}
        <ScrollView
          contentContainerStyle={styles.servicesContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                {service.description && (
                  <Text style={styles.serviceDescription}>
                    {service.description}
                  </Text>
                )}
                <View style={styles.serviceDetails}>
                  <Text style={styles.servicePrice}>{service.price} ₺</Text>
                  <Text style={styles.serviceDuration}>{service.duration} min</Text>
                  {service.category && (
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{service.category}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.serviceActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditService(service)}
                >
                  <Ionicons name="create-outline" size={20} color="#1B9AAA" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteService(service.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredServices.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No service found</Text>
            </View>
          )}
        </ScrollView>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>

        {/* MODAL FOR ADD/EDIT */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* MODAL HEADER */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingService ? "Edit Service" : "Add New Service"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* MODAL BODY */}
              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Service Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={serviceName}
                    onChangeText={setServiceName}
                    placeholder="Hizmet adını girin"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={serviceDescription}
                    onChangeText={setServiceDescription}
                    placeholder="Hizmet açıklaması girin"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Price *</Text>
                    <TextInput
                      style={styles.input}
                      value={servicePrice}
                      onChangeText={setServicePrice}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Duration (min) *</Text>
                    <TextInput
                      style={styles.input}
                      value={serviceDuration}
                      onChangeText={setServiceDuration}
                      placeholder="30"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category</Text>
                  <TextInput
                    style={styles.input}
                    value={serviceCategory}
                    onChangeText={setServiceCategory}
                    placeholder="Kategori girin"
                  />
                </View>
              </ScrollView>

              {/* MODAL FOOTER */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleAddService}
                >
                  <Text style={styles.saveButtonText}>
                    {editingService ? "Update" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /*************
   * SAFE AREA & CONTAINER
   *************/
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },

  /*************
   * HEADER
   *************/
  header: {
    // Daha az boşluk için büyük paddingTop yerine küçük bir değer kullanın
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  /*************
   * TOP BAR (SEARCH + CATEGORY FILTER)
   *************/
  topBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10, // Daha küçük tutuldu
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
    paddingVertical: 8,
    fontSize: 16,
  },

  // Kategori filtresi alanı
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 5, // Daha az boşluk
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: "#1B9AAA",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
  },
  activeCategoryButtonText: {
    color: "#fff",
  },

  /*************
   * SERVICES LIST
   *************/
  servicesContainer: {
    paddingHorizontal: 20,
    paddingTop: 10, // Üst boşluğu küçük tutuyoruz
    paddingBottom: 20,
  },
  serviceCard: {
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
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  serviceDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B9AAA",
    marginRight: 15,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
    marginRight: 15,
  },
  categoryTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 12,
    color: "#666",
  },
  serviceActions: {
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

  /*************
   * FLOATING ADD BUTTON
   *************/
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

  /*************
   * MODAL
   *************/
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
  formRow: {
    flexDirection: "row",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
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

  /*************
   * ERROR TEXT (UNAUTHORIZED CASE)
   *************/
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
});
