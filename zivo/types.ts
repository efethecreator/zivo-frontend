// Define types for the application
import type { ImageSourcePropType } from "react-native"

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  userType: 'customer' | 'business' | 'store_owner' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  type: string;
  address: string | {
    street: string;
    city: string;
    postalCode: string;
  };
  images?: string[];
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  duration: number;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  workerId: string;
  customerId: string;
  appointmentTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  services: {
    serviceId: string;
    price: number;
    duration: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}
