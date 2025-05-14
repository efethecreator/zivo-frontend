"use client";

// hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

export const useCurrentUser = () => {
  const { tokenAvailable, loggingOut } = useAuth();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    enabled: !!tokenAvailable && !loggingOut, // Token varsa VE çıkış yapılmıyorsa çalıştır
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};
