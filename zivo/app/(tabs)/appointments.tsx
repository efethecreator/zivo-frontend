"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native"
import { router } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { getMyAppointments } from "../../services/appointment.service"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

export default function AppointmentsScreen() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: getMyAppointments,
  })

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image source={require("../../assets/images/images.jpeg")} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>Scheduled Appointments</Text>
      <Text style={styles.emptyText}>
        Discover and book beauty & wellness professionals near you. Your scheduled appointments will show up here.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Text style={styles.emptyButtonText}>Let's Go</Text>
      </TouchableOpacity>
    </View>
  )

  const renderAppointmentItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.appointmentCard} onPress={() => {}}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.businessName}>{item.businessName}</Text>
        <Text style={styles.appointmentDate}>
          {new Date(item.appointmentTime).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.services[0]?.name || 'Service'}</Text>
          <Text style={styles.serviceTime}>
            {new Date(item.appointmentTime).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <View style={styles.staffInfo}>
          <Text style={styles.staffLabel}>Staff:</Text>
          <Text style={styles.staffName}>{item.workerName || 'Not assigned'}</Text>
        </View>
      </View>

      <View style={styles.appointmentActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Reschedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Text style={styles.title}>Appointments</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading appointments...</Text>
        </View>
      ) : !appointments?.length ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.appointmentsList}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: "#1B9AAA",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  appointmentsList: {
    padding: 15,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  appointmentDate: {
    fontSize: 14,
    color: "#666",
  },
  appointmentDetails: {
    marginBottom: 15,
  },
  serviceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 16,
  },
  serviceTime: {
    fontSize: 16,
  },
  staffInfo: {
    flexDirection: "row",
  },
  staffLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  staffName: {
    fontSize: 14,
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#000",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff3b30",
  },
  cancelButtonText: {
    color: "#ff3b30",
  },
})
