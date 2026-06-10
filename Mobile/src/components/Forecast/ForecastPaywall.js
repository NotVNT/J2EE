import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppColors } from "../../constants/colors";
import { scale } from "../../utils/layoutScale";

/**
 * Paywall screen shown to non-PREMIUM users.
 * Prompts upgrade to access forecast features.
 */
export default function ForecastPaywall() {
  const navigation = useNavigation();
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.BG }]}>
      <Text style={styles.icon}>🔮</Text>
      <Text style={[styles.title, { color: colors.TEXT }]}>Dự báo & Phát hiện bất thường</Text>
      <Text style={[styles.desc, { color: colors.TEXT_SECONDARY }]}>
        Dự đoán chi tiêu tháng tới theo danh mục, phát hiện giao dịch bất thường,{"\n"}
        và nhận phân tích AI chuyên sâu về tài chính của bạn.
      </Text>

      <View style={[styles.features, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
        <Text style={[styles.feature, { color: colors.TEXT }]}>📊 Dự báo chi tiêu theo danh mục</Text>
        <Text style={[styles.feature, { color: colors.TEXT }]}>📈 Biểu đồ xu hướng 6 tháng</Text>
        <Text style={[styles.feature, { color: colors.TEXT }]}>🚨 Cảnh báo giao dịch bất thường</Text>
        <Text style={[styles.feature, { color: colors.TEXT }]}>🤖 Phân tích AI chuyên sâu</Text>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: colors.PRIMARY }]}
        onPress={() => navigation.navigate("SettingTab", { screen: "Payment" })}
      >
        <Text style={[styles.buttonText, { color: colors.WHITE || "#FFFFFF" }]}>Nâng cấp lên PREMIUM</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(24),
    paddingVertical: scale(40),
  },
  icon: {
    fontSize: scale(64),
    marginBottom: scale(16),
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: scale(12),
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: scale(21),
    marginBottom: scale(20),
  },
  features: {
    alignSelf: "stretch",
    borderRadius: scale(14),
    borderWidth: 1,
    padding: scale(16),
    gap: scale(10),
    marginBottom: scale(24),
  },
  feature: {
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    borderRadius: scale(14),
    paddingVertical: scale(14),
    paddingHorizontal: scale(32),
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
});
