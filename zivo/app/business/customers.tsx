// app/business/customers.tsx
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

export const unstable_settings = {
  unstable_ignoreRoute: true,
};


interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  lastVisit?: string;
  totalVisits: number;
  totalSpent: number;
}

export default function CustomersScreen() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    // Burada gerçek bir API çağrısı yapılacak
    // Şimdilik mock veri kullanıyoruz
    const mockCustomers: Customer[] = [
      {
        id: 101,
        name: "Ahmet Yılmaz",
        phone: "555-123-4567",
        email: "ahmet@example.com",
        lastVisit: "2023-04-15",
        totalVisits: 5,
        totalSpent: 450,
      },
      {
        id: 102,
        name: "Ayşe Demir",
        phone: "555-987-6543",
        email: "ayse@example.com",
        lastVisit: "2023-04-10",
        totalVisits: 3,
        totalSpent: 320,
      },
      {
        id: 103,
        name: "Mustafa Kaya",
        phone: "555-456-7890",
        lastVisit: "2023-04-05",
        totalVisits: 2,
        totalSpent: 180,
      },
      {
        id: 104,
        name: "Zeynep Aydın",
        phone: "555-789-0123",
        email: "zeynep@example.com",
        lastVisit: "2023-03-28",
        totalVisits: 7,
        totalSpent: 620,
      },
      {
        id: 105,
        name: "Mehmet Öz",
        phone: "555-234-5678",
        lastVisit: "2023-03-20",
        totalVisits: 1,
        totalSpent: 100,
      },
    ];

    setCustomers(mockCustomers);
  }, []);

  const handleAddCustomer = () => {
    if (!customerName || !customerPhone) return;

    const newCustomer: Customer = {
      id: editingCustomer ? editingCustomer.id : customers.length + 101,
      name: customerName,
      phone: customerPhone,
      email: customerEmail || undefined,
      totalVisits: editingCustomer ? editingCustomer.totalVisits : 0,
      totalSpent: editingCustomer ? editingCustomer.totalSpent : 0,
    };

    if (editingCustomer) {
      // Güncelleme
      setCustomers(
        customers.map((customer) =>
          customer.id === editingCustomer.id ? newCustomer : customer
        )
      );
    } else {
      // Yeni ekleme
      setCustomers([...customers, newCustomer]);
    }

    resetForm();
    setModalVisible(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email || "");
    setModalVisible(true);
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

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
        <Text style={styles.headerTitle}>Müşteriler</Text>
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

      <ScrollView style={styles.content}>
        {filteredCustomers.map((customer) => (
          <TouchableOpacity
            key={customer.id}
            style={styles.customerCard}
            onPress={() => router.push(`/customers/${customer.id}`)}
          >
            <View style={styles.customerAvatar}>
              <Text style={styles.avatarText}>
                {customer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
              {customer.lastVisit && (
                <Text style={styles.customerLastVisit}>
                  Son ziyaret: {new Date(customer.lastVisit).toLocaleDateString("tr-TR")}
                </Text>
              )}
            </View>
            <View style={styles.customerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{customer.totalVisits}</Text>
                <Text style={styles.statLabel}>Ziyaret</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{customer.totalSpent} ₺</Text>
                <Text style={styles.statLabel}>Harcama</Text>
              </View>
            </View>
            <View style={styles.customerActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleEditCustomer(customer);
                }}
              >
                <Ionicons name="create-outline" size={20} color="#1B9AAA" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteCustomer(customer.id);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredCustomers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Müşteri bulunamadı</Text>
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
                {editingCustomer ? "Müşteriyi Düzenle" : "Yeni Müşteri Ekle"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Müşteri Adı *</Text>
                <TextInput
                  style={styles.input}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Müşteri adını girin"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefon *</Text>
                <TextInput
                  style={styles.input}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="Telefon numarası girin"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>E-posta (İsteğe bağlı)</Text>
                <TextInput
                  style={styles.input}
                  value={customerEmail}
                  onChangeText={setCustomerEmail}
                  placeholder="E-posta adresi girin"
                  keyboardType="email-address"
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
                style={[styles.button, styles.saveButton, (!customerName || !customerPhone) && styles.disabledButton]}
                onPress={handleAddCustomer}
                disabled={!customerName || !customerPhone}
              >
                <Text style={styles.saveButtonText}>
                  {editingCustomer ? "Güncelle" : "Ekle"}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  customerCard: {
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
  customerAvatar: {
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
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  customerPhone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  customerLastVisit: {
    fontSize: 12,
    color: "#999",
  },
  customerStats: {
    flexDirection: "row",
    marginLeft: 10,
    marginRight: 10,
  },
  statItem: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B9AAA",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  customerActions: {
    justifyContent: "space-around",
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
  disabledButton: {
    backgroundColor: "#ccc",
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