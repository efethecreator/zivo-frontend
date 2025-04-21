import { api } from "../utils/api";
import type { Service } from "../types";

export const getServiceById = async (id: string): Promise<Service> => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const getBusinessServices = async (businessId: string): Promise<Service[]> => {
  const response = await api.get(`/services/business/${businessId}`);
  return response.data;
};

export const createService = async (service: Omit<Service, "id">): Promise<Service> => {
  const response = await api.post("/services", service);
  return response.data;
};

export const updateService = async (id: number, service: Partial<Service>): Promise<Service> => {
  const response = await api.put(`/services/${id}`, service);
  return response.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await api.delete(`/services/${id}`);
}; 