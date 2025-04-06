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
  address: string;
  images: ImageSourcePropType[];
};

export type Service = {
  id: number;
  businessId: number;
  name: string;
  price: number;
  duration: number;
};

export type Appointment = {
  id: number;
  businessId: number;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
  staff: string;
};
