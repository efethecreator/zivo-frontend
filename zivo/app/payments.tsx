"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentsScreen() {
  const [activeTab, setActiveTab] = useState("methods");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "methods" && styles.activeTab]}
          onPress={() => setActiveTab("methods")}
        >
          <Text style={styles.tabText}>Payment Methods</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={styles.tabText}>Payment history</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "methods" ? (
          <View>
            <View style={styles.paymentMethodItem}>
              <View style={styles.paymentMethodLogo}>
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/1200px-Apple_Pay_logo.svg.png",
                  }}
                  style={{ width: 40, height: 20 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.paymentMethodText}>Apple pay</Text>
            </View>
            <View style={styles.divider} />
          </View>
        ) : (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>No payment history yet</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addCardButton}>
        <Text style={styles.addCardButtonText}>Add card</Text>
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
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    fontFamily: "Outfit-Bold",
  },
  helpButton: {
    marginLeft: 20,
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
    fontFamily: "Outfit-Regular",
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
  paymentMethodText: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "Outfit-Light",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Bold",
  },
});
