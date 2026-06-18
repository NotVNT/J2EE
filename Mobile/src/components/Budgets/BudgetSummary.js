import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS } from "../../constants/colors";
import { formatMoney } from "../../utils/format";

export default function BudgetSummary({ summary }) {
  const { t } = useTranslation();
  return (
    <View style={styles.overviewCard}>
      <Text style={styles.overviewTitle}>{t("budgetSummary.monthlyBudget")}</Text>
      <Text style={styles.overviewLimit}>{t("budgetSummary.limit")} {formatMoney(summary.totalLimit)}</Text>
      <Text style={styles.overviewSpent}>{t("budgetSummary.spent")} {formatMoney(summary.totalSpent)}</Text>
      <Text style={styles.overviewHint}>{t("budgetSummary.itemsNearLimit", { count: summary.warningCount })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  overviewTitle: {
    color: COLORS.PEACH,
    fontWeight: "700",
    fontSize: 13,
  },
  overviewLimit: {
    marginTop: 6,
    color: COLORS.WHITE,
    fontWeight: "800",
    fontSize: 20,
  },
  overviewSpent: {
    marginTop: 2,
    color: COLORS.PEACH,
    fontWeight: "700",
  },
  overviewHint: {
    marginTop: 8,
    color: COLORS.ROSE_MIST,
    fontSize: 12,
  }
});
