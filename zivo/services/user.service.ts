import api from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'business' | 'store_owner' | 'admin';
  profile?: {
    phone?: string;
    location?: string;
    gender?: string;
    biography?: string;
    photoUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: {
    fullName?: string;
    email?: string;
  }
): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const updateMyProfile = async (
  data: {
    phone?: string;
    location?: string;
    gender?: string;
    biography?: string;
    photoUrl?: string;
  }
): Promise<User> => {
  const response = await api.put('/profile', data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getMe = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
}; 