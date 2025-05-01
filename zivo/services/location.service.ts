import { api } from '../utils/api';
import { Business } from './business.service';

export interface Location {
  lat: number;
  lng: number;
  radius?: number; // in kilometers
}

export const getNearbyBusinesses = async (location: Location) => {
  const response = await api.get<Business[]>('/explore/nearby', {
    params: {
      lat: location.lat,
      lng: location.lng,
      radius: location.radius || 5 // default 5km radius
    }
  });
  return response.data;
};
