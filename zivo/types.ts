// types.ts
export interface User {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role: "customer" | "business";
  address?: {
    street?: string;
    apartment?: string;
    city?: string;
    postCode?: string;
  };
  preferences?: {
    serviceType?: "women" | "men" | "everyone";
    notifications?: boolean;
  };
  business?: Business;
}

export interface WorkingHours {
  [day: string]: {
    isOpen: boolean;
    open: string;
    close: string;
  };
}

export interface Business {
  id?: number;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  workingHours: WorkingHours;
  services?: Service[];
  staff?: Staff[];
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number; // dakika cinsinden
  category?: string;
}

export interface Staff {
  id: number;
  name: string;
  position: string;
  services: number[]; // Sunduğu hizmetlerin ID'leri
  workingHours?: {
    [key: string]: {
      isWorking: boolean;
      start: string;
      end: string;
    };
  };
}

export interface Appointment {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
}