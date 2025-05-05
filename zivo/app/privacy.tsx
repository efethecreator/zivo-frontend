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

export default function PrivacyScreen() {
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [receiveOffers, setReceiveOffers] = useState(false);
  const [receivePartnerOffers, setReceivePartnerOffers] = useState(false);

  const handleSave = () => {
    router.push("/(tabs)/profile");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Privacy</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.privacyItem}
          onPress={() => router.push("/(tabs)")}
        >
          <View style={styles.privacyItemLeft}>
            <View
              style={[
                styles.checkIcon,
                termsAccepted && styles.checkIconActive,
              ]}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyItemText}>
                <Text style={styles.requiredStar}>* </Text>
                Acceptance of the Terms of Service and confirmation of having
                read the Privacy Policy
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.privacyItem}
          onPress={() => setReceiveOffers(!receiveOffers)}
        >
          <View style={styles.privacyItemLeft}>
            <View style={styles.checkbox}>
              {receiveOffers && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.privacyItemText}>
              Consent to receiving Booksy offers
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.privacyItem}
          onPress={() => setReceivePartnerOffers(!receivePartnerOffers)}
        >
          <View style={styles.privacyItemLeft}>
            <View style={styles.checkbox}>
              {receivePartnerOffers && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.privacyItemText}>
              Consent to receiving offers of parties cooperating with Booksy
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
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
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginRight: 40,
    fontFamily: "Outfit-Bold",
  },
  content: {
    flex: 1,
  },
  privacyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  privacyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyItemText: {
    fontSize: 16,
    flex: 1,
    fontFamily: "Outfit-Light",
  },
  requiredStar: {
    color: "red",
  },
  checkIcon: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkIconActive: {
    backgroundColor: "#1B9AAA",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 16,
    height: 16,
    backgroundColor: "#1B9AAA",
  },
  saveButton: {
    backgroundColor: "#1B9AAA",
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Outfit-Bold",
  },
});
