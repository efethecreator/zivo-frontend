// app/business/help-center.tsx
"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export const unstable_settings = {
  unstable_ignoreRoute: true,
};


export default function HelpCenterScreen() {
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "Randevu sistemini nasıl kullanabilirim?",
      answer: "Randevu sistemini kullanmak için öncelikle 'Randevular' sekmesine gidin. Ardından sağ alt köşedeki '+' butonuna tıklayarak yeni bir randevu oluşturabilirsiniz. Müşteri bilgilerini, hizmet türünü, personeli ve randevu saatini seçerek randevuyu oluşturabilirsiniz."
    },
    {
      id: 2,
      question: "Hizmet fiyatlarını nasıl güncelleyebilirim?",
      answer: "Hizmet fiyatlarını güncellemek için 'Hizmetler' sekmesine gidin. Güncellemek istediğiniz hizmetin yanındaki düzenleme ikonuna tıklayın. Açılan formda fiyat bilgisini güncelleyip 'Güncelle' butonuna tıklayın."
    },
    {
      id: 3,
      question: "Personel çalışma saatlerini nasıl ayarlayabilirim?",
      answer: "Personel çalışma saatlerini ayarlamak için 'Personel' sekmesine gidin. İlgili personeli seçip düzenleme sayfasına girin. Burada çalışma saatlerini günlere göre ayarlayabilirsiniz."
    },
    {
      id: 4,
      question: "Müşteri bilgilerini nasıl görebilirim?",
      answer: "Müşteri bilgilerini görmek için 'Müşteriler' sayfasına gidin. Burada tüm müşterilerinizin listesini görebilir, arama yapabilir ve detaylı bilgilerine ulaşabilirsiniz."
    },
    {
      id: 5,
      question: "Ödeme ayarlarını nasıl yapabilirim?",
      answer: "Ödeme ayarlarını yapmak için 'Profil' sekmesinden 'Ödeme Ayarları' sayfasına gidin. Burada ödeme yöntemlerinizi ekleyebilir, düzenleyebilir ve fatura bilgilerinizi güncelleyebilirsiniz."
    },
  ];

  const toggleFaq = (id: number) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
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
        <TouchableOpacity onPress={() => router.replace("/business/profile")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım Merkezi</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchButtonText}>Yardım konusu ara...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
        </View>

        {faqs.map((faq) => (
          <View key={faq.id} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.faqQuestion}
              onPress={() => toggleFaq(faq.id)}
            >
              <Text style={styles.faqQuestionText}>{faq.question}</Text>
              <Ionicons
                name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            {expandedFaq === faq.id && (
              <View style={styles.faqAnswer}>
                <Text style={styles.faqAnswerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yardım Kategorileri</Text>
        </View>

        <TouchableOpacity style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <Ionicons name="calendar-outline" size={24} color="#1B9AAA" />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Randevular</Text>
            <Text style={styles.categoryDescription}>
              Randevu oluşturma, düzenleme ve iptal etme
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryItem}>
          <View  />
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <Ionicons name="list-outline" size={24} color="#1B9AAA" />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Hizmetler</Text>
            <Text style={styles.categoryDescription}>
              Hizmet ekleme, düzenleme ve fiyatlandırma
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <Ionicons name="people-outline" size={24} color="#1B9AAA" />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Personel</Text>
            <Text style={styles.categoryDescription}>
              Personel yönetimi ve çalışma saatleri
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <Ionicons name="card-outline" size={24} color="#1B9AAA" />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Ödemeler</Text>
            <Text style={styles.categoryDescription}>
              Ödeme yöntemleri ve fatura bilgileri
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactSupportButton}
          onPress={() => router.push("/business/contact-support")}
        >
          <Text style={styles.contactSupportButtonText}>Destek Ekibiyle İletişime Geç</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 20,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
  },
  searchButtonText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 10,
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  faqAnswerText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
  },
  contactSupportButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  contactSupportButtonText: {
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