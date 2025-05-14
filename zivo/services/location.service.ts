import { api } from "../utils/api";
import type { Business } from "./business.service";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

export interface Location {
  lat: number;
  lng: number;
  radius?: number; // in kilometers
}

export interface UserLocation {
  userId: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export const getNearbyBusinesses = async (location: Location) => {
  const response = await api.get<Business[]>("/explore/nearby", {
    params: {
      lat: location.lat,
      lng: location.lng,
      radius: location.radius || 5, // default 5km radius
    },
  });
  return response.data;
};

export const saveUserLocation = async (location: {
  latitude: number;
  longitude: number;
  address?: string;
}): Promise<UserLocation> => {
  const response = await api.post("/user-locations", location);
  return response.data;
};

export const getUserLocations = async (): Promise<UserLocation[]> => {
  const response = await api.get("/user-locations/my");
  return response.data;
};

export const deleteUserLocation = async (id: string): Promise<void> => {
  await api.delete(`/user-locations/${id}`);
};

// Mutation hooks
export const useSaveUserLocationMutation = () => {
  const { invalidateProfile } = useInvalidateAppData();

  return useMutation({
    mutationFn: saveUserLocation,
    onSuccess: () => {
      invalidateProfile();
    },
  });
};

export const useDeleteUserLocationMutation = () => {
  const { invalidateProfile } = useInvalidateAppData();

  return useMutation({
    mutationFn: deleteUserLocation,
    onSuccess: () => {
      invalidateProfile();
    },
  });
};
