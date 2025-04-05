import { Slot } from "expo-router"
import { AuthProvider } from "../context/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Slot /> {/* Alt sayfaları slot ile inject eder */}
      </AuthProvider>
    </QueryClientProvider>
  )
}
