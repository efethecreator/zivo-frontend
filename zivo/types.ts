// Define types for the application
import type { ImageSourcePropType } from "react-native"

export type User = {
  id?: number
  name?: string
  email: string
  phone?: string
  password?: string
  role?: "customer" | "business" | "store_owner" | "admin"
  address?: {
    street?: string
    apartment?: string
    city?: string
    postCode?: string
  }
  business?: Business
}

export type Business = {
  id: number
  name: string
  // Make address a union type to support both string and object formats
  address:
    | string
    | {
        street: string
        city: string
        postalCode: string
      }
  type?: string
  workingHours?: Record<string, any>
  // Add these properties from mock data
  rating?: number
  reviews?: number
  images?: ImageSourcePropType[]
  // Additional properties used in business screens
  description?: string
  logo?: string
  phone?: string
  email?: string
  website?: string
  services?: Service[]
  staff?: Staff[]
}

export type Service = {
  id: number
  businessId?: number
  name: string
  description?: string
  price: number
  duration: number
  category?: string
}

export type Appointment = {
  id: number
  businessId?: number
  businessName?: string
  customerId?: number
  customerName?: string
  customerPhone?: string
  serviceId?: number
  serviceName: string
  staffId?: number
  staffName?: string
  staff?: string
  date: string
  time: string
  duration?: number
  status?: "pending" | "confirmed" | "cancelled" | "completed"
}

export type Staff = {
  id: number
  name: string
  position: string
  services: number[] // Sunduğu hizmetlerin ID'leri
  workingHours?: {
    [key: string]: {
      isWorking: boolean
      start: string
      end: string
    }
  }
  businessId?: number
  phone?: string
  email?: string
  image?: string
  description?: string
}
