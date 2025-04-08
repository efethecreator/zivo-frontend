// app/auth/business-register.tsx
"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import type { User, Business } from "../../types";

export default function BusinessRegisterScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // İşletme bilgileri
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("salon");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
  // Çalışma saatleri
  const [workingHours, setWorkingHours] = useState({
    monday: { isOpen: true, open: "09:00", close: "18:00" },
    tuesday: { isOpen: true, open: "09:00", close: "18:00" },
    wednesday: { isOpen: true, open: "09:00", close: "18:00" },
    thursday: { isOpen: true, open: "09:00", close: "18:00" },
    friday: { isOpen: true, open: "09:00", close: "18:00" },
    saturday: { isOpen: true, open: "10:00", close: "16:00" },
    sunday: { isOpen: false, open: "10:00", close: "16:00" },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email.trim() || !name.trim() || !password.trim() || !businessName.trim()) return;
  
    setIsLoading(true);
  
    // Simulate API call
    setTimeout(() => {
      const businessData: Business = {
        id: 1, // Mock ID
        name: businessName,
        type: businessType,
        address: {
          street: address,
          city,
          postalCode,
        },
        workingHours,
      };
      
      const userData: Partial<User> = { 
        name, 
        email, 
        phone, 
        password, 
        role: 'business', // Rolü açıkça 'business' olarak ayarlayın
        business: businessData
      };
      
      console.log("Registering business user:", userData); // Debug için
      register(userData);
      setIsLoading(false);
      router.replace("/business/dashboard");
    }, 1000);
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.title}>İşletme Hesabı Oluştur</Text>
      <Text style={styles.subtitle}>Kişisel Bilgiler</Text>
      <Text style={styles.description}>
        Önce kişisel bilgilerinizi girelim
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ad ve Soyad</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Telefon Numarası</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Şifre</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.buttonText}>Devam Et</Text>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.title}>İşletme Bilgileri</Text>
      <Text style={styles.description}>
        İşletmeniz hakkında bilgi verin
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>İşletme Adı</Text>
        <TextInput
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>İşletme Türü</Text>
        <View style={styles.businessTypeContainer}>
          {[
            { id: "salon", label: "Güzellik Salonu" },
            { id: "barber", label: "Berber" },
            { id: "spa", label: "Spa & Masaj" },
            { id: "nail", label: "Tırnak Bakımı" },
            { id: "other", label: "Diğer" },
          ].map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.businessTypeButton,
                businessType === type.id && styles.businessTypeButtonActive,
              ]}
              onPress={() => setBusinessType(type.id)}
            >
              <Text
                style={[
                  styles.businessTypeText,
                  businessType === type.id && styles.businessTypeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adres</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Sokak, Mahalle, No"
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Şehir</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>Posta Kodu</Text>
          <TextInput
            style={styles.input}
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setStep(1)}
        >
          <Text style={styles.secondaryButtonText}>Geri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, { flex: 2 }]}
          onPress={() => setStep(3)}
        >
          <Text style={styles.buttonText}>Devam Et</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.title}>Çalışma Saatleri</Text>
      <Text style={styles.description}>
        İşletmenizin çalışma saatlerini belirleyin
      </Text>

      {Object.entries(workingHours).map(([day, hours]) => {
        const dayNames: Record<string, string> = {
          monday: "Pazartesi",
          tuesday: "Salı",
          wednesday: "Çarşamba",
          thursday: "Perşembe",
          friday: "Cuma",
          saturday: "Cumartesi",
          sunday: "Pazar",
        };

        return (
          <View key={day} style={styles.workingHoursRow}>
            <View style={styles.dayContainer}>
              <Text style={styles.dayText}>{dayNames[day]}</Text>
              <Switch
                value={hours.isOpen}
                onValueChange={(value) =>
                  setWorkingHours({
                    ...workingHours,
                    [day]: { ...hours, isOpen: value },
                  })
                }
                trackColor={{ false: "#ddd", true: "#1B9AAA" }}
              />
            </View>

            {hours.isOpen && (
              <View style={styles.hoursContainer}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeLabel}>Açılış</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={hours.open}
                    onChangeText={(value) =>
                      setWorkingHours({
                        ...workingHours,
                        [day]: { ...hours, open: value },
                      })
                    }
                    placeholder="09:00"
                  />
                </View>

                <View style={styles.timeContainer}>
                  <Text style={styles.timeLabel}>Kapanış</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={hours.close}
                    onChangeText={(value) =>
                      setWorkingHours({
                        ...workingHours,
                        [day]: { ...hours, close: value },
                      })
                    }
                    placeholder="18:00"
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setStep(2)}
        >
          <Text style={styles.secondaryButtonText}>Geri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, { flex: 2 }]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                s === step && styles.activeStepDot,
                s < step && styles.completedStepDot,
              ]}
            >
              {s < step ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : (
                <Text style={styles.stepNumber}>{s}</Text>
              )}
            </View>
          ))}
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  activeStepDot: {
    backgroundColor: "#1B9AAA",
  },
  completedStepDot: {
    backgroundColor: "#4CAF50",
  },
  stepNumber: {
    color: "#666",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#1B9AAA",
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1B9AAA",
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#1B9AAA",
    fontSize: 16,
    fontWeight: "600",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  businessTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  businessTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    marginBottom: 10,
  },
  businessTypeButtonActive: {
    backgroundColor: "#1B9AAA",
  },
  businessTypeText: {
    fontSize: 14,
    color: "#666",
  },
  businessTypeTextActive: {
    color: "#fff",
  },
  workingHoursRow: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 15,
  },
  dayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
  },
  hoursContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
});