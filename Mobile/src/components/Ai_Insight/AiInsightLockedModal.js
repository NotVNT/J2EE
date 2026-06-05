import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, useAppColors } from "../../constants/colors";

const FEATURES = [
  "Tóm tắt tài chính hằng tháng",
  "Dự báo dòng tiền",
  "Phân tích rủi ro",
  "Khuyến nghị cá nhân hóa"
];

export default function AiInsightLockedModal({ visible, onClose }) {
  const colors = useAppColors();
  const navigation = useNavigation();

  const handleUpgrade = () => {
    onClose();
    setTimeout(() => {
      navigation.navigate("SettingTab", { screen: "Payment" });
    }, 300);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.OVERLAY }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.ROSE_MIST, borderColor: colors.CARD_BORDER }]}>
            <Text style={styles.icon}>✨</Text>
          </View>

          <View style={[styles.lockBadge, { backgroundColor: colors.BG }]}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={[styles.lockText, { color: colors.PRIMARY }]}>PREMIUM</Text>
          </View>

          <Text style={[styles.title, { color: colors.TEXT }]}>AI Insight</Text>
          <Text style={[styles.description, { color: colors.TEXT_SECONDARY }]}>
            Phân tích tài chính thông minh với AI, dự báo dòng tiền và gợi ý cá nhân hóa.
          </Text>

          <View style={styles.featureList}>
            {FEATURES.map((feature) => (
              <View key={feature} style={styles.featureItem}>
                <Text style={[styles.featureCheck, { color: colors.INCOME }]}>✓</Text>
                <Text style={[styles.featureText, { color: colors.TEXT }]}>{feature}</Text>
              </View>
            ))}
          </View>

          <Pressable style={[styles.upgradeButton, { backgroundColor: colors.PRIMARY }]} onPress={handleUpgrade}>
            <Text style={[styles.upgradeButtonText, { color: colors.WHITE }]}>Nâng cấp Premium</Text>
          </Pressable>

          <Pressable style={[styles.laterButton, { backgroundColor: colors.ROSE_MIST, borderColor: colors.PRIMARY }]} onPress={onClose}>
            <Text style={[styles.laterButtonText, { color: colors.PRIMARY }]}>Để sau</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.ROSE_MIST,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER
  },
  icon: {
    fontSize: 24
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
    gap: 4
  },
  lockIcon: {
    fontSize: 12
  },
  lockText: {
    color: COLORS.PRIMARY,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8
  },
  description: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16
  },
  featureList: {
    width: "100%",
    marginBottom: 20,
    gap: 8
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  featureCheck: {
    color: COLORS.INCOME,
    fontSize: 13,
    fontWeight: "700"
  },
  featureText: {
    color: COLORS.TEXT,
    fontSize: 13
  },
  upgradeButton: {
    width: "100%",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10
  },
  upgradeButtonText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "800"
  },
  laterButton: {
    width: "100%",
    backgroundColor: COLORS.ROSE_MIST,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center"
  },
  laterButtonText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 14,
    fontWeight: "800"
  }
});
