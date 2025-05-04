import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext"; // yolunu gerektiği gibi ayarla
import { Text, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Eğer kullanıcı varsa anasayfaya yönlendir
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Kullanıcı yoksa login'e yönlendir
  return <Redirect href="/auth/login" />;
}
