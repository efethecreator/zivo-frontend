import api from './api';

export interface Business {
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
  const response = await api.post('/business', data);
  return response.data;
};

export const getAllBusinesses = async (): Promise<Business[]> => {
  const response = await api.get('/business');
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
  const response = await api.get(`/appointments/business/${businessId}/customers`);
  return response.data;
}; 