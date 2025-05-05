// components/Loading.tsx

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

type LoadingProps = {
  message?: string;
  size?: "small" | "large";
  color?: string;
};

const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  size = "large",
  color = "#2596be",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontFamily: "Outfit-Regular",
  },
});
