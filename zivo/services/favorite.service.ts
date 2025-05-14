//favorite.service.ts

import { api } from "../utils/api";
import type { Favorite } from "../types";
import { SecureStoreService } from "./secureStore.service";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateAppData } from "../hooks/useInvalidateAppData";

export const addToFavorites = async (businessId: string) => {
  const response = await api.post<Favorite>("/favorites", { businessId });
  return response.data;
};

export const removeFromFavorites = async (id: string) => {
  const response = await api.delete<Favorite>(`/favorites/${id}`);
  return response.data;
};

export const getFavorites = async () => {
  // Token kontrolü
  const token = await SecureStoreService.getItem("zivo_token");
  if (!token) {
    console.log("[Favorites] Token yok, istek atılmıyor");
    return [];
  }

  try {
    const response = await api.get<Favorite[]>("/favorites/my");
    return response.data;
  } catch (error) {
    console.error("[Favorites] Failed to get favorites:", error);
    return [];
  }
};

// Mutation hooks
export const useAddToFavoritesMutation = () => {
  const { invalidateFavorites, invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: addToFavorites,
    onSuccess: (_, businessId) => {
      invalidateFavorites();
      invalidateBusiness(businessId);
    },
  });
};

export const useRemoveFromFavoritesMutation = () => {
  const { invalidateFavorites, invalidateBusiness } = useInvalidateAppData();

  return useMutation({
    mutationFn: removeFromFavorites,
    onSuccess: (data) => {
      invalidateFavorites();
      // Eğer silinen favori içinde businessId varsa, o business'ı da invalidate et
      if (data && "businessId" in data) {
        invalidateBusiness(data.businessId as string);
      }
    },
  });
};
