import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mockServices } from '../../mocks/services';
import { Service } from '../../types';

type CalendarDay = {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
};

const daysOfWeek = ['MA', 'DI', 'WO', 'DO', 'VR', 'ZA', 'ZO'];

// Generate calendar days for April 2025
const generateCalendarDays = (): CalendarDay[] => {
  const days: CalendarDay[] = [];
  // Start with March 31 (previous month)
  days.push({ day: 31, month: 3, year: 2025, isCurrentMonth: false });
  
  // April has 30 days
  for (let i = 1; i <= 30; i++) {
    days.push({ day: i, month: 4, year: 2025, isCurrentMonth: true });
  }
  
  // Add first few days of May
  for (let i = 1; i <= 4; i++) {
    days.push({ day: i, month: 5, year: 2025, isCurrentMonth: false });
  }
  
  return days;
};

const timeSlots = ['19:30', '20:00', '20:30'];

export default function BookingScreen() {
  const { appointmentId } = useLocalSearchParams();
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<CalendarDay>({ day: 11, month: 4, year: 2025, isCurrentMonth: true });
  const [selectedTime, setSelectedTime] = useState('19:30');
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState({ name: 'Mudie', image: 'https://via.placeholder.com/50' });
  const calendarDays = generateCalendarDays();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundService = mockServices.find(s => s.id.toString() === appointmentId);
      if (foundService) {
        setService(foundService);
      }
      setIsLoading(false);
    }, 1000);
  }, [appointmentId]);

  const handleContinue = () => {
    // In a real app, this would create the appointment
    // For demo, just go back to the business page
    router.back();
  };

  if (isLoading || !service) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading booking details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book an Appointment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <Text style={styles.monthTitle}>April 2025</Text>
          
          {/* Days of week */}
          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day, index) => (
              <Text key={index} style={styles.dayOfWeekText}>{day}</Text>
            ))}
          </View>
          
          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.calendarDay,
                  day.isCurrentMonth ? {} : styles.otherMonthDay,
                  selectedDate.day === day.day && 
                  selectedDate.month === day.month ? 
                  styles.selectedDay : {}
                ]}
                onPress={() => setSelectedDate(day)}
                disabled={!day.isCurrentMonth}
              >
                <Text 
                  style={[
                    styles.calendarDayText,
                    day.isCurrentMonth ? {} : styles.otherMonthDayText,
                    selectedDate.day === day.day && 
                    selectedDate.month === day.month ? 
                    styles.selectedDayText : {}
                  ]}
                >
                  {day.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time slots */}
        <View style={styles.timeSlotsContainer}>
          {timeSlots.map((time, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.timeSlot,
                selectedTime === time ? styles.selectedTimeSlot : {}
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text 
                style={[
                  styles.timeSlotText,
                  selectedTime === time ? styles.selectedTimeSlotText : {}
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Service details */}
        <View style={styles.serviceDetailsContainer}>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceTime}>{selectedTime} - {
              // Calculate end time (add 30 minutes)
              selectedTime.split(':').map((part, i) => 
                i === 0 ? 
                  (parseInt(part) + Math.floor(service.duration / 60)).toString().padStart(2, '0') : 
                  ((parseInt(part) + (service.duration % 60)) % 60).toString().padStart(2, '0')
              ).join(':')
            }</Text>
          </View>
          
          <View style={styles.staffContainer}>
            <Text style={styles.staffLabel}>Staff:</Text>
            <View style={styles.staffInfo}>
              <Image 
                source={{ uri: staff.image }} 
                style={styles.staffImage} 
              />
              <Text style={styles.staffName}>{staff.name}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.addServiceButton}>
            <Ionicons name="add" size={20} color="#1B9AAA" />
            <Text style={styles.addServiceText}>Add another service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom bar with price and continue button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>€ {service.price.toFixed(2)}</Text>
          <Text style={styles.priceSubtext}>30d</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.privacyText}>
        Your personal data will be processed by the partner with whom you are booking an appointment. You can find more information <Text style={styles.privacyLink}>here</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calendarContainer: {
    padding: 15,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayOfWeekText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  calendarDayText: {
    fontSize: 16,
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  otherMonthDayText: {
    color: '#ccc',
  },
  selectedDay: {
    backgroundColor: '#1B9AAA',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    padding: 15,
  },
  timeSlot: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    marginHorizontal: 5,
  },
  timeSlotText: {
    fontSize: 16,
  },
  selectedTimeSlot: {
    backgroundColor: '#1B9AAA',
    borderColor: '#1B9AAA',
  },
  selectedTimeSlotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  serviceDetailsContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    margin: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceTime: {
    fontSize: 14,
    color: '#666',
  },
  staffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  staffLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '500',
  },
  addServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
  },
  addServiceText: {
    color: '#1B9AAA',
    marginLeft: 5,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceContainer: {
    flex: 1,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  priceSubtext: {
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#1B9AAA',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    padding: 15,
  },
  privacyLink: {
    color: '#1B9AAA',
    textDecorationLine: 'underline',
  },
});
