// app/business/working-hours.tsx
"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export const unstable_settings = {
  unstable_ignoreRoute: true,
};


interface WorkingHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export default function WorkingHoursScreen() {
  const { user, updateUser } = useAuth();
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(() => {
    const raw = user?.business?.workingHours;
    if (!raw || typeof raw !== "object") return defaultWorkingHours;
  
    return Object.entries(raw).map(([day, data]) => ({
      day,
      isOpen: data.isOpen,
      openTime: data.open,
      closeTime: data.close,
    }));
  });
  

  const timeOptions = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30", "22:00"
  ];

  const handleToggleDay = (index: number) => {
    const newWorkingHours = [...workingHours];
    newWorkingHours[index].isOpen = !newWorkingHours[index].isOpen;
    setWorkingHours(newWorkingHours);
  };

  const handleChangeTime = (index: number, field: string, value: string) => {
    const newWorkingHours = [...workingHours];
    newWorkingHours[index][field as keyof WorkingHour] = value;
    setWorkingHours(newWorkingHours);
  };

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        business: {
          ...user.business,
          workingHours,
        },
      });
      router.back();
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
        <Text style={styles.headerTitle}>Çalışma Saatleri</Text>
      </View>

      <ScrollView style={styles.content}>
        {workingHours.map((hours, index) => (
          <View key={hours.day} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{hours.day}</Text>
              <Switch
                value={hours.isOpen}
                onValueChange={() => handleToggleDay(index)}
                trackColor={{ false: "#ddd", true: "#1B9AAA" }}
              />
            </View>

            {hours.isOpen && (
              <View style={styles.hoursContainer}>
                <View style={styles.timeSelector}>
                  <Text style={styles.timeLabel}>Açılış</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.timeScroll}
                  >
                    {timeOptions.map((time) => (
                      <TouchableOpacity
                        key={`open-${time}`}
                        style={[
                          styles.timeOption,
                          hours.openTime === time && styles.selectedTimeOption,
                        ]}
                        onPress={() => handleChangeTime(index, "openTime", time)}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            hours.openTime === time && styles.selectedTimeText,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.timeSelector}>
                  <Text style={styles.timeLabel}>Kapanış</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.timeScroll}
                  >
                    {timeOptions.map((time) => (
                      <TouchableOpacity
                        key={`close-${time}`}
                        style={[
                          styles.timeOption,
                          hours.closeTime === time && styles.selectedTimeOption,
                        ]}
                        onPress={() => handleChangeTime(index, "closeTime", time)}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            hours.closeTime === time && styles.selectedTimeText,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Kaydet</Text>
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
  dayContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  dayName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  hoursContainer: {
    padding: 15,
  },
  timeSelector: {
    marginBottom: 15,
  },
  timeLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  timeScroll: {
    flexDirection: "row",
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  selectedTimeOption: {
    backgroundColor: "#1B9AAA",
  },
  timeText: {
    fontSize: 14,
    color: "#333",
  },
  selectedTimeText: {
    color: "#fff",
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