import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingScreen({ text = "Đang tải..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0f766e" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc"
  },
  text: {
    marginTop: 10,
    color: "#334155",
    fontSize: 14
  }
});
