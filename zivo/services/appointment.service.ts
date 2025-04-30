import api from '../utils/api';
import type { Appointment } from "../types";

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

export const createAppointment = async (data: CreateAppointmentRequest): Promise<Appointment> => {
  const response = await api.post('/appointments', data);
  return response.data;
};

export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get('/appointments/my');
  return response.data;
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const cancelAppointment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/appointments/${id}`);
  } catch (error) {
    console.error('Error in cancelAppointment:', error);
    throw error;
  }
};

export const getBusinessAppointments = async (
  businessId: string
): Promise<Appointment[]> => {
  const response = await api.get(`/appointments/business/${businessId}`);
  return response.data;
};

export const updateAppointmentStatus = async (
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
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