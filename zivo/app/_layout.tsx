import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";
import { AuthProvider } from "../context/AuthContext";
import Toast from "react-native-toast-message";

// React Query Client ayarı
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Slot />
        <Toast />
      </AuthProvider>
    </QueryClientProvider>
  );
}
