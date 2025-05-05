import { isLoggedOut } from "../services/api"

// API isteklerini wrapped eden fonksiyon
export const safeApiCall = async <T>(\
  apiCall: () => Promise<T>,
  defaultValue: T | null = null
)
: Promise<T | null> =>
{
  // Eğer kullanıcı logout yapmışsa, API çağrısını yapma
  if (isLoggedOut) {
    console.log("🛑 Logout durumunda API isteği yapılmadı")
    return defaultValue;
  }

  try {
    return await apiCall();
  } catch (error: any) {
    if (error.isLogoutRelated) {
      console.log("🔇 Logout ile ilgili hata sessizce geçildi")
      return defaultValue;
    }
    throw error
  }
}
