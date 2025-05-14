import { api } from "../utils/api";
import type { Service } from "../types";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

export const getServiceById = async (id: string): Promise<Service> => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const getBusinessServices = async (
  businessId: string
): Promise<Service[]> => {
  const response = await api.get(`/services/business/${businessId}`);
  return response.data;
};

export const createService = async (
  service: Omit<Service, "id">
): Promise<Service> => {
  const response = await api.post("/services", service);
  return response.data;
};

export const updateService = async (
  id: number,
  service: Partial<Service>
): Promise<Service> => {
  const response = await api.put(`/services/${id}`, service);
  return response.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await api.delete(`/services/${id}`);
};

// Mutation hooks
export const useCreateServiceMutation = () => {
  const { invalidateServices } = useInvalidateAppData();

  return useMutation({
    mutationFn: createService,
    onSuccess: (_, variables) => {
      if ("businessId" in variables) {
        invalidateServices(variables.businessId as string);
      } else {
        invalidateServices();
      }
    },
  });
};

export const useUpdateServiceMutation = () => {
  const { invalidateServices } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({ id, service }: { id: number; service: Partial<Service> }) =>
      updateService(id, service),
    onSuccess: (_, variables) => {
      if (variables.service && "businessId" in variables.service) {
        invalidateServices(variables.service.businessId as string);
      } else {
        invalidateServices();
      }
    },
  });
};

export const useDeleteServiceMutation = () => {
  const { invalidateServices } = useInvalidateAppData();

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      invalidateServices();
    },
  });
};
