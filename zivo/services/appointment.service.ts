import api from "../utils/api"
import type { Appointment } from "../types"

export interface CreateAppointmentRequest {
  businessId: string
  workerId: string
  appointmentTime: string
  totalPrice: number
  services: {
    serviceId: string
    price: number
    duration: number
  }[]
}

export const createAppointment = async (data: CreateAppointmentRequest): Promise<Appointment> => {
  const response = await api.post("/appointments", data)
  return response.data
}

export const getAppointments = async (): Promise<{ data: Appointment[]; error?: string }> => {
  try {
    const response = await api.get("/appointments/my");
    const raw = response.data;

    // 🔐 Gelen veri bir dizi değilse, Object.values ile dizileştir
    const data = Array.isArray(raw) ? raw : Object.values(raw);

    return { data };
  } catch (error: any) {
    console.error("[Appointments] Failed to get appointments:", error);

    if (error.response?.status === 403) {
      return {
        data: [],
        error: "You don't have permission to view appointments. This feature may require a different account type.",
      };
    }

    return {
      data: [],
      error: "Unable to load appointments. Please try again later.",
    };
  }
};


export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await api.get(`/appointments/${id}`)
  return response.data
}

export const cancelAppointment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/appointments/${id}`)
  } catch (error) {
    console.error("Error in cancelAppointment:", error)
    throw error
  }
}

export const getBusinessAppointments = async (businessId: string): Promise<Appointment[]> => {
  try {
    const response = await api.get(`/appointments/business/${businessId}`)
    return response.data
  } catch (error) {
    console.error("[Appointments] Failed to get business appointments:", error)
    // Return empty array instead of throwing to prevent UI errors
    return []
  }
}

export const updateAppointmentStatus = async (
  id: string,
  status: "pending" | "confirmed" | "cancelled" | "completed",
): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}/status`, { status })
  return response.data
}

export const updateAppointmentWorker = async (id: string, workerId: string): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}/assign`, { workerId })
  return response.data
}

export const rescheduleAppointment = async (
  id: string,
  appointmentTime: string
): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}/reschedule`, {
    appointmentTime, 
  });
  return response.data;
};
