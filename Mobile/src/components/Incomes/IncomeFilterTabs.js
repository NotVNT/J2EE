import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";
import { INCOME_FILTER_TYPES } from "../../hooks/useIncomes";

export default function IncomeFilterTabs({ filterType, onChange }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const FILTER_OPTIONS = [
    { label: t("incomeFilterTabs.thisMonth"), value: INCOME_FILTER_TYPES.current },
    { label: t("incomeFilterTabs.all"), value: INCOME_FILTER_TYPES.all }
  ];

  return (
    <View style={[styles.filterCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
      <Text style={[styles.filterTitle, { color: colors.TEXT }]}>{t("expenseFilterTabs.timeRange")}</Text>
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((option, index) => {
          const isActive = filterType === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.filterChip,
                { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER },
                index === FILTER_OPTIONS.length - 1 && styles.filterChipLast,
                isActive && { backgroundColor: colors.INCOME_LIGHT, borderColor: colors.ACTION_INCOME || colors.INCOME }
              ]}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.filterChipText, { color: isActive ? (colors.ACTION_INCOME || colors.INCOME) : colors.TEXT }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    padding: 12,
    marginBottom: 12
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.TEXT,
    marginBottom: 10
  },
  filterRow: {
    flexDirection: "row"
  },
  filterChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    backgroundColor: COLORS.CARD,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8
  },
  filterChipLast: {
    marginRight: 0
  },
  filterChipActive: {
    borderColor: "#22C55E",
    backgroundColor: "rgba(34,197,94,0.15)"
  },
  filterChipText: {
    color: COLORS.TEXT,
    fontWeight: "700",
    fontSize: 12
  },
  filterChipTextActive: {
    color: "#22C55E"
  }
});
