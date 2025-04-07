export interface User {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role: string;
    // address özelliğini ekleyin
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
  }