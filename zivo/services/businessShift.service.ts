import { api } from "../utils/api";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";
import { BusinessShift } from "../types";


export interface ShiftTime {
  id: string;
  time: string; // "09:00", "09:30", etc.
  createdAt: string;
  updatedAt: string;
}

export const getBusinessShifts = async (
  businessId: string
): Promise<BusinessShift[]> => {
  const response = await api.get(`/business-shifts/business/${businessId}`);
  return response.data;
};

export const getShiftTimes = async (): Promise<ShiftTime[]> => {
  const response = await api.get(`/shift-times`);
  return response.data;
};

export const createBusinessShift = async (data: {
  businessId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}): Promise<BusinessShift> => {
  const response = await api.post("/business-shifts", data);
  return response.data;
};

export const updateBusinessShift = async (
  id: string,
  data: {
    startTime?: string;
    endTime?: string;
    isActive?: boolean;
  }
): Promise<BusinessShift> => {
  const response = await api.put(`/business-shifts/${id}`, data);
  return response.data;
};

export const deleteBusinessShift = async (id: string): Promise<void> => {
  await api.delete(`/business-shifts/${id}`);
};

// Mutation hooks
export const useCreateBusinessShiftMutation = () => {
  const { invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: createBusinessShift,
    onSuccess: (_, variables) => {
      invalidateBusiness(variables.businessId);
    },
  });
};

export const useUpdateBusinessShiftMutation = () => {
  const { invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { startTime?: string; endTime?: string; isActive?: boolean };
    }) => updateBusinessShift(id, data),
    onSuccess: (data) => {
      if (data && data.businessId) {
        invalidateBusiness(data.businessId);
      }
    },
  });
};

export const useDeleteBusinessShiftMutation = () => {
  const { invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: deleteBusinessShift,
    onSuccess: () => {
      // Burada businessId'yi doğrudan alamıyoruz, bu yüzden
      // ya tüm business'ları invalidate etmeliyiz ya da
      // mutation çağrısında businessId'yi de geçmeliyiz
      invalidateBusiness();
    },
  });
};
