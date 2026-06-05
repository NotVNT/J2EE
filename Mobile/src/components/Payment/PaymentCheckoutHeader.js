import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";

export default function PaymentCheckoutHeader({ canGoBack, onExit, onGoBack, title }) {
  const colors = useAppColors();
  const handleBack = canGoBack ? onGoBack : onExit;

  return (
    <View style={[styles.header, { backgroundColor: colors.CARD, borderBottomColor: colors.CARD_BORDER }]}>
      <View style={styles.headerTextWrap}>
        <Text style={[styles.headerTitle, { color: colors.TEXT }]}>{title}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.TEXT_SECONDARY }]}>Bạn có thể thanh toán ngay trong app. Nếu cần mở app ngân hàng, ứng dụng sẽ bật liên kết ngoài.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        style={[styles.secondaryButton, { borderColor: colors.CARD_BORDER, backgroundColor: colors.CARD }]}
        onPress={handleBack}
      >
        <Ionicons name="arrow-back-outline" size={16} color={colors.TEXT} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  headerTextWrap: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800"
  },
  headerSubtitle: {
    marginTop: 4,
    lineHeight: 20
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  }
});
