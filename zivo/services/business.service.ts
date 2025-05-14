import api from "../utils/api";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

export interface Business {
  type: string;
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  profileImageUrl: string;
  coverImageUrl: string;
  businessTypeId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export interface SearchParams {
  search?: string;
  type?: string;
  sortBy?: "name" | "distance" | "rating";
}

export const createBusiness = async (data: {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  profileImageUrl: string;
  coverImageUrl: string;
  businessTypeId: string;
}): Promise<Business> => {
  const response = await api.post("/business", data);
  return response.data;
};

export const getAllBusinesses = async (): Promise<Business[]> => {
  const response = await api.get("/business");
  return response.data;
};

export const getBusinessById = async (id: string): Promise<Business> => {
  const response = await api.get(`/business/${id}`);
  return response.data;
};

export const updateBusiness = async (
  id: string,
  data: {
    name?: string;
    ownerId?: string;
  }
): Promise<Business> => {
  const response = await api.put(`/business/${id}`, data);
  return response.data;
};

export const deleteBusiness = async (id: string): Promise<void> => {
  await api.delete(`/business/${id}`);
};

export const getBusinessAppointments = async (
  businessId: string
): Promise<any[]> => {
  const response = await api.get(`/appointments/business/${businessId}`);
  return response.data;
};

export const getBusinessWorkers = async (
  businessId: string
): Promise<any[]> => {
  const response = await api.get(`/business-workers/${businessId}`);
  return response.data;
};

export const getBusinessServices = async (
  businessId: string
): Promise<any[]> => {
  const response = await api.get(`/services?businessId=${businessId}`);
  return response.data;
};

export const getBusinessCustomers = async (
  businessId: string
): Promise<any[]> => {
  const response = await api.get(
    `/appointments/business/${businessId}/customers`
  );
  return response.data;
};

export const getNearbyBusinesses = async (
  lat: number,
  lng: number,
  radius: number
): Promise<Business[]> => {
  try {
    const response = await api.get("/explore/nearby", {
      params: {
        lat,
        lng,
        radius,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nearby businesses:", error);
    throw error;
  }
};

export const searchBusinesses = async (
  params: SearchParams
): Promise<Business[]> => {
  try {
    const response = await api.get("/explore/search", {
      params: {
        search: params.search,
        type: params.type,
        sortBy: params.sortBy,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching businesses:", error);
    throw error;
  }
};

// Mutation hooks
export const useCreateBusinessMutation = () => {
  const { invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      invalidateBusiness();
    },
  });
};

export const useUpdateBusinessMutation = () => {
  const { invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; ownerId?: string };
    }) => updateBusiness(id, data),
    onSuccess: (_, variables) => {
      invalidateBusiness(variables.id);
    },
  });
};

export const useDeleteBusinessMutation = () => {
  const { invalidateBusiness, invalidateAll } = useInvalidateAppData();

  return useMutation({
    mutationFn: deleteBusiness,
    onSuccess: (_, id) => {
      invalidateBusiness(id);
      invalidateAll(); // İşletme silindiğinde tüm verileri yenile
    },
  });
};
