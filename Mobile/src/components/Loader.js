import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Loader({ text = "Đang xử lý...", fullScreen = false, overlay = false }) {
  return (
    <View style={[styles.wrapper, fullScreen && styles.fullScreen, overlay && styles.overlay]}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  fullScreen: {
    flex: 1,
    backgroundColor: "#05070b"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 999
  },
  container: {
    backgroundColor: "#0a120e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f3529",
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 12
  },
  text: {
    color: "#e8f6ea",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  }
});
