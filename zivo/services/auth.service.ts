// services/auth.service.ts

import { useMutation } from "@tanstack/react-query";
import api from "./api";
import type { User } from './user.service';

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (userData: {
  fullName: string;
  email: string;
  password: string;
  userType: 'customer' | 'business' | 'store_owner' | 'admin';
}): Promise<LoginResponse> => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      login(data.email, data.password),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: {
      fullName: string;
      email: string;
      password: string;
      userType: 'customer' | 'business' | 'store_owner' | 'admin';
    }) => register(data),
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: logout,
  });
};
