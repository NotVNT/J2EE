import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../constants/colors";

export default function Loader({ text = "Đang xử lý...", fullScreen = false, overlay = false }) {
  return (
    <View style={[styles.wrapper, fullScreen && styles.fullScreen, overlay && styles.overlay]}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
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
    backgroundColor: COLORS.DARK_BG
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.OVERLAY,
    zIndex: 999
  },
  container: {
    backgroundColor: COLORS.DARK_CARD_SOLID,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.DARK_BORDER,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 12
  },
  text: {
    color: COLORS.DARK_TEXT,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  }
});
