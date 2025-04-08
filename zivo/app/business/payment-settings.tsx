// app/business/payment-settings.tsx
"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export const unstable_settings = {
  unstable_ignoreRoute: true,
};


export default function PaymentSettingsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("methods");
  const [showAddCard, setShowAddCard] = useState(false);
  
  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSave = () => {
    // Burada kart bilgilerini kaydetme işlemi yapılacak
    setShowAddCard(false);
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
        <TouchableOpacity onPress={() => router.replace("/business/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme Ayarları</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "methods" && styles.activeTab]}
          onPress={() => setActiveTab("methods")}
        >
          <Text style={styles.tabText}>Ödeme Yöntemleri</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "billing" && styles.activeTab]}
          onPress={() => setActiveTab("billing")}
        >
          <Text style={styles.tabText}>Fatura Bilgileri</Text>
        </TouchableOpacity>
      </View>

      {!showAddCard ? (
        <ScrollView style={styles.content}>
          {activeTab === "methods" ? (
            <View>
              <View style={styles.paymentMethodItem}>
                <View style={styles.paymentMethodLogo}>
                  <Image
                    source={{
                      uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png",
                    }}
                    style={{ width: 40, height: 20 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodText}>Visa •••• 4242</Text>
                  <Text style={styles.paymentMethodExpiry}>Son Kullanma: 12/25</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />

              <View style={styles.paymentMethodItem}>
                <View style={styles.paymentMethodLogo}>
                  <Image
                    source={{
                      uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1200px-MasterCard_Logo.svg.png",
                    }}
                    style={{ width: 40, height: 30 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodText}>Mastercard •••• 5555</Text>
                  <Text style={styles.paymentMethodExpiry}>Son Kullanma: 09/24</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
            </View>
          ) : (
            <View>
              <View style={styles.billingInfoContainer}>
                <Text style={styles.billingInfoLabel}>Fatura Adı</Text>
                <Text style={styles.billingInfoValue}>{user.business?.name || "İşletmem"}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.billingInfoContainer}>
                <Text style={styles.billingInfoLabel}>Vergi Numarası</Text>
                <Text style={styles.billingInfoValue}>1234567890</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.billingInfoContainer}>
                <Text style={styles.billingInfoLabel}>Fatura Adresi</Text>
                <Text style={styles.billingInfoValue}>
                  Örnek Mahallesi, Örnek Caddesi No:123, Örnek İlçe/İl
                </Text>
              </View>
              <View style={styles.divider} />

              <TouchableOpacity style={styles.editBillingButton}>
                <Text style={styles.editBillingButtonText}>Fatura Bilgilerini Düzenle</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.cardFormContainer}>
            <Text style={styles.cardFormTitle}>Yeni Kart Ekle</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Kart Numarası</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Kart Üzerindeki İsim</Text>
              <TextInput
                style={styles.input}
                value={cardName}
                onChangeText={setCardName}
                placeholder="AD SOYAD"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Son Kullanma Tarihi</Text>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="AA/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === "methods" && !showAddCard ? (
        <TouchableOpacity style={styles.addCardButton} onPress={() => setShowAddCard(true)}>
          <Text style={styles.addCardButtonText}>Kart Ekle</Text>
        </TouchableOpacity>
      ) : showAddCard ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setShowAddCard(false)}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    margin: 20,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  paymentMethodLogo: {
    width: 50,
    height: 30,
    justifyContent: "center",
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 10,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "500",
  },
  paymentMethodExpiry: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    padding: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
  },
  billingInfoContainer: {
    paddingVertical: 15,
  },
  billingInfoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  billingInfoValue: {
    fontSize: 16,
  },
  editBillingButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  editBillingButtonText: {
    fontSize: 16,
    color: "#1B9AAA",
  },
  addCardButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  addCardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardFormContainer: {
    padding: 10,
  },
  cardFormTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
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
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#1B9AAA",
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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