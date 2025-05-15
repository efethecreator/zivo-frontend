export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  userType: "customer" | "business" | "store_owner" | "admin";
  createdAt: string;
  updatedAt: string;
}

export type Category = {
  id: string;
  name: string;
  icon: string;  // ✅ burada ImageSourcePropType değil sadece string
  businessTypeId: string;
}


// Update the Business interface to include all the missing properties
export interface Business {
  coverImageUrl: string;
  id: string;
  name: string;
  type: string;
  address:
    | string
    | {
        street: string;
        city: string;
        postalCode: string;
      };
  images?: string[];
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
  city?: string;
  district?: string;
  postalCode?: string;
  website?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  contacts?: Array<{
    id: string;
    contactName: string;
    contactValue: string;
  }>;
  shifts?: Array<{
    id: string;
    dayOfWeek: number;
    isActive: boolean;
    shiftTime?: {
      startTime: string;
      endTime: string;
    };
  }>;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  durationMinutes: number;
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
  status: "pending" | "confirmed" | "cancelled" | "completed";
  services: {
    serviceId: string;
    name: string;
    price: number;
    durationMinutes: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessShift {
  id: string;
  businessId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  shiftTimeId: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
  shiftTime?: ShiftTime;
}

export interface ShiftTime {
  id: string;
  startTime: string; // Format: "HH:MM:SS"
  endTime: string; // Format: "HH:MM:SS"
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
}
