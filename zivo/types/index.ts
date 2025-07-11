// Define types for the application
import { ImageSourcePropType } from "react-native";

export type User = {
  id?: number;
  name?: string;
  email: string;
  phone?: string;
  password?: string; // Added password to fix type error
  role?: "customer" | "store_owner" | "admin";
};

export type Business = {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  address: string | { street: string; city: string; postalCode: string };
  images: string[];
  type: string;
  workingHours?: Record<string, { open: string; close: string }>;
};

export type Service = {
  id: number;
  businessId: number;
  name: string;
  price: number;
  duration: number;
  description?: string;
  category?: string;
};

export type Appointment = {
  id: number;
  businessId: number;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  staff: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
};

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  businessId: string;
  workerTypeId: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}


export interface BusinessShift {
  id: string
  businessId: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  shiftTimeId: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
  deletedBy?: string
  shiftTime?: ShiftTime
}

export interface ShiftTime {
  id: string
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
  deletedBy?: string
}