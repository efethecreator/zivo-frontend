//favorite.service.ts

import { api } from '../utils/api';
import { Favorite } from '../types';

export const addToFavorites = async (businessId: string) => {
  const response = await api.post<Favorite>(`/favorites`, { businessId });
  return response.data;
};

export const removeFromFavorites = async (id: string) => {
  const response = await api.delete<Favorite>(`/favorites/${id}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get<Favorite[]>('/favorites/my');
  return response.data;
};
