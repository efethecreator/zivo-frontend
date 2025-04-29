import { api } from '../utils/api';
import { Business } from './business.service';

export const addToFavorites = async (businessId: string) => {
  const response = await api.post<Business>(`/favorites/${businessId}`);
  return response.data;
};

export const removeFromFavorites = async (businessId: string) => {
  const response = await api.delete<Business>(`/favorites/${businessId}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get<Business[]>('/favorites');
  return response.data;
}; 