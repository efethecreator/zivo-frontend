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
    // Burada gerçek bir API çağrısı yapılacak
    // Şimdilik mock veri kullanıyoruz
    const mockServices: Service[] = [
      {
        id: 1,
        name: "Saç Kesimi",
        description: "Profesyonel saç kesimi",
        price: 100,
        duration: 30,
        category: "Saç",
      },
      {
        id: 2,
        name: "Saç Boyama",
        description: "Tek renk saç boyama",
        price: 200,
        duration: 60,
        category: "Saç",
      },
      {
        id: 3,
        name: "Sakal Tıraşı",
        description: "Sakal şekillendirme ve tıraş",
        price: 50,
        duration: 20,
        category: "Sakal",
      },
      {
        id: 4,
        name: "Manikür",
        description: "Tırnak bakımı ve oje",
        price: 80,
        duration: 45,
        category: "Tırnak",
      },
    ];

    setServices(mockServices);

    // Kategorileri çıkar
    const uniqueCategories = Array.from(
      new Set(mockServices.map((service) => service.category))
    ).filter((category): category is string => category !== undefined);
    
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
        services.map((service) =>
          service.id === editingService.id ? { ...newService, id: service.id } : service
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
    setServices(services.filter((service) => service.id !== id));
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
        <Text style={styles.headerTitle}>Hizmetler</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Hizmet ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
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
            Tümü
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

      <ScrollView style={styles.content}>
        {filteredServices.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              {service.description && (
                <Text style={styles.serviceDescription}>{service.description}</Text>
              )}
              <View style={styles.serviceDetails}>
                <Text style={styles.servicePrice}>{service.price} ₺</Text>
                <Text style={styles.serviceDuration}>{service.duration} dk</Text>
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
            <Text style={styles.emptyStateText}>Hizmet bulunamadı</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
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
              <Text style={styles.modalTitle}>
                {editingService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Hizmet Adı *</Text>
                <TextInput
                  style={styles.input}
                  value={serviceName}
                  onChangeText={setServiceName}
                  placeholder="Hizmet adını girin"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Açıklama</Text>
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
                  <Text style={styles.label}>Fiyat (₺) *</Text>
                  <TextInput
                    style={styles.input}
                    value={servicePrice}
                    onChangeText={setServicePrice}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Süre (dk) *</Text>
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
                <Text style={styles.label}>Kategori</Text>
                <TextInput
                  style={styles.input}
                  value={serviceCategory}
                  onChangeText={setServiceCategory}
                  placeholder="Kategori girin"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddService}
              >
                <Text style={styles.saveButtonText}>
                  {editingService ? "Güncelle" : "Ekle"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
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
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
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