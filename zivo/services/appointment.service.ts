import api from "../utils/api";
import type { Appointment } from "../types";
import { SecureStoreService } from "../services/secureStore.service";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";
import { format } from "date-fns";

export interface CreateAppointmentRequest {
  businessId: string;
  workerId: string;
  appointmentTime: string;
  totalPrice: number;
  services: {
    serviceId: string;
    price: number;
    duration: number;
  }[];
}

export const createAppointment = async (
  data: CreateAppointmentRequest
): Promise<Appointment> => {
  const response = await api.post("/appointments", data);
  return response.data;
};

export const getAppointments = async () => {
  // Token kontrolü
  const token = await SecureStoreService.getItem("zivo_token");
  if (!token) {
    console.log("[Appointments] Token yok, istek atılmıyor");
    return { data: [], error: null };
  }

  try {
    const response = await api.get("/appointments/my");
    return { data: response.data, error: null };
  } catch (error) {
    console.error("[Appointments] Failed to get appointments:", error);
    return { data: [], error: "Failed to fetch appointments" };
  }
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const cancelAppointment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/appointments/${id}`);
  } catch (error) {
    console.error("Error in cancelAppointment:", error);
    throw error;
  }
};

export const getBusinessAppointments = async (
  businessId: string
): Promise<Appointment[]> => {
  try {
    const response = await api.get(`/appointments/business/${businessId}`);
    return response.data;
  } catch (error) {
    console.error("[Appointments] Failed to get business appointments:", error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

export const updateAppointmentStatus = async (
  id: string,
  status: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}/status`, { status });
  return response.data;
};

export const updateAppointmentWorker = async (
  id: string,
  workerId: string
): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}/assign`, { workerId });
  return response.data;
};

export const rescheduleAppointment = async (
  id: string,
  appointmentTime: string
): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}/reschedule`, {
    appointmentTime,
  });
  return response.data;
};

export const getAppointmentsByDate = async (
  businessId: string,
  date: string
): Promise<Appointment[]> => {
  try {
    const response = await api.get(
      `/appointments/business/${businessId}/date/${date}`
    );
    return response.data;
  } catch (error) {
    console.error("[Appointments] Failed to get appointments by date:", error);
    return [];
  }
};

// Mutation hooks
export const useCreateAppointmentMutation = () => {
  const { invalidateAll, invalidateAppointmentsByDate } =
    useInvalidateAppData();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: (_, variables) => {
      invalidateAll(); // Tüm ilgili verileri yenile

      // Randevu tarihini ISO string'den alıp formatla
      const appointmentDate = new Date(variables.appointmentTime);
      const formattedDate = format(appointmentDate, "yyyy-MM-dd");

      // Seçilen tarih için saat dilimlerini yenile
      invalidateAppointmentsByDate(variables.businessId, formattedDate);
    },
  });
};

export const useCancelAppointmentMutation = () => {
  const { invalidateAppointments } = useInvalidateAppData();

  return useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      invalidateAppointments(); // Randevu listesini yenile
    },
  });
};

export const useUpdateAppointmentStatusMutation = () => {
  const { invalidateAppointments } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "pending" | "confirmed" | "cancelled" | "completed";
    }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      invalidateAppointments(); // Randevu listesini yenile
    },
  });
};

export const useUpdateAppointmentWorkerMutation = () => {
  const { invalidateAppointments } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({ id, workerId }: { id: string; workerId: string }) =>
      updateAppointmentWorker(id, workerId),
    onSuccess: () => {
      invalidateAppointments(); // Randevu listesini yenile
    },
  });
};

export const useRescheduleAppointmentMutation = () => {
  const { invalidateAppointments, invalidateAppointmentsByDate } =
    useInvalidateAppData();

  return useMutation({
    mutationFn: ({
      id,
      appointmentTime,
    }: {
      id: string;
      appointmentTime: string;
    }) => rescheduleAppointment(id, appointmentTime),
    onSuccess: (data) => {
      invalidateAppointments(); // Randevu listesini yenile

      // Eğer business ID ve tarih bilgisi varsa, o tarihe ait randevuları da yenile
      if (data && data.businessId) {
        const appointmentDate = new Date(data.appointmentTime);
        const formattedDate = format(appointmentDate, "yyyy-MM-dd");
        invalidateAppointmentsByDate(data.businessId, formattedDate);
      }
    },
  });
};
