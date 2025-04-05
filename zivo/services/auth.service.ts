// services/auth.service.ts

import { mockUsers } from "../mocks/users";

export const mockLogin = async (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        return reject(new Error("Geçersiz e-posta veya şifre"));
      }

      return resolve({
        token: "mock-jwt-token",
        user,
      });
    }, 800); // loading simülasyonu
  });
};
