import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAppColors } from "../../constants/colors";
import { getSafeAreaTop } from "../../utils/safeArea";
import AppIcon from "../ui/AppIcon";
import AmountText from "../ui/AmountText";

export default function HomeTopHeader({
  onMenuPress,
  onBellPress,
  unreadCount = 0,
  balance = 0,
  isBalanceVisible = true,
  onToggleBalance,
}) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const displayCount = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <View style={[styles.container, { paddingTop: getSafeAreaTop(insets, 8) }]}>
      <View style={styles.leftContainer}>
        <View style={styles.balanceRow}>
          {isBalanceVisible ? (
            <AmountText
              value={balance}
              style={[styles.balanceText, { color: colors.TEXT }]}
            />
          ) : (
            <Text style={[styles.balanceText, { color: colors.TEXT }]}>••••••</Text>
          )}
          <Pressable onPress={onToggleBalance} style={styles.eyeButton}>
            <AppIcon
              name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.TEXT_MUTED || "#B8A6AC"}
            />
          </Pressable>
        </View>
        <Text style={[styles.subText, { color: colors.TEXT_SECONDARY }]}>{t("dashboard.totalBalance")}</Text>
      </View>

      <View style={styles.rightContainer}>
        <Pressable
          style={[styles.bellButton, { borderColor: colors.BORDER, backgroundColor: colors.SURFACE }]}
          onPress={onBellPress}
        >
          <Image source={require("../../assets/accessories/bell.png")} style={[styles.bellIcon, { tintColor: colors.TEXT }]} />
          {unreadCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.EXPENSE_COLOR || "#EF4444", borderColor: colors.SURFACE }]}>
              <Text style={styles.badgeText}>{displayCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  leftContainer: {
    flex: 1,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 22,
    fontWeight: "700",
  },
  eyeButton: {
    marginLeft: 8,
    padding: 4,
  },
  subText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  bellIcon: {
    width: 18,
    height: 18,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "900",
  },
  swapButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 36,
  },
  swapIcon: {
    marginRight: 4,
  },
  swapText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
