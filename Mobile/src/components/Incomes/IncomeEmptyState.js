import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import AppIcon from "../ui/AppIcon";
import { scale } from "../../utils/layoutScale";

export default function IncomeEmptyState() {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={styles.emptyState}>
      <View style={[styles.iconContainer, { backgroundColor: colors.INCOME_LIGHT || "rgba(34,197,94,0.15)" }]}>
        <AppIcon name="cash-outline" size={28} color={colors.ACTION_INCOME || colors.INCOME} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.TEXT }]}>{t("incomeEmptyState.title")}</Text>
      <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
        {t("incomeEmptyState.description")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(24),
    paddingVertical: scale(40),
  },
  iconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(12),
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: scale(6),
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
});
