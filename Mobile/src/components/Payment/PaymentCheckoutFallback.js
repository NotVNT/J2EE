import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, useAppColors } from "../../constants/colors";

export default function PaymentCheckoutFallback({ onBackToPayment }) {
  const colors = useAppColors();

  return (
    <View style={[styles.fallbackContainer, { backgroundColor: colors.BG }]}>
      <Text style={[styles.fallbackTitle, { color: colors.TEXT }]}>Không tìm thấy liên kết thanh toán</Text>
      <Text style={[styles.fallbackText, { color: colors.TEXT_SECONDARY }]}>Hãy quay lại và tạo giao dịch mới.</Text>
      <Pressable style={[styles.primaryButton, { backgroundColor: colors.PRIMARY }]} onPress={onBackToPayment}>
        <Text style={styles.primaryButtonText}>Quay lại thanh toán</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center"
  },
  fallbackText: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18
  },
  primaryButton: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontWeight: "750"
  }
});
