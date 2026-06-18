import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";

export default function ReportAdviceCard({ report }) {
  const { t } = useTranslation();
  const colors = useAppColors();

  const strengths = useMemo(() => {
    if (!report) return [];
    const savingsRate = report.savingsRate ?? 0;
    const budgetsOnTrack = report.budgetsOnTrack ?? 0;
    const totalBudgets = report.totalBudgets ?? 0;
    const spendingChangePercent = report.spendingChangePercent ?? 0;
    const completedGoals = report.completedGoalsThisMonth ?? 0;
    const list = [];

    if (savingsRate > 20) {
      list.push(t("reportComponents.strengthSavings", { rate: savingsRate.toFixed(1) }));
    }
    if (totalBudgets > 0 && budgetsOnTrack === totalBudgets) {
      list.push(t("reportComponents.strengthBudget"));
    }
    if (spendingChangePercent < 0) {
      list.push(t("reportComponents.strengthSpendingDecrease", { percent: Math.abs(spendingChangePercent).toFixed(1) }));
    }
    if (completedGoals > 0) {
      list.push(t("reportComponents.strengthGoalCompleted", { count: completedGoals }));
    }
    if (list.length === 0) {
      list.push(t("reportComponents.strengthDefault"));
    }
    return list;
  }, [report, t]);

  const improvements = useMemo(() => {
    if (!report) return [];
    const savingsRate = report.savingsRate ?? 0;
    const budgetsOnTrack = report.budgetsOnTrack ?? 0;
    const totalBudgets = report.totalBudgets ?? 0;
    const completedGoals = report.completedGoalsThisMonth ?? 0;
    const list = [];

    if (savingsRate < 10) {
      list.push(t("reportComponents.improveSavingsLow", { rate: savingsRate.toFixed(1) }));
    }
    if (savingsRate < 0) {
      list.push(t("reportComponents.improveDeficit"));
    }
    if (totalBudgets > 0 && budgetsOnTrack < totalBudgets) {
      list.push(t("reportComponents.improveBudgetOverspent", { count: totalBudgets - budgetsOnTrack }));
    }
    if (completedGoals === 0) {
      list.push(t("reportComponents.improveNoGoal"));
    }
    if (list.length === 0) {
      list.push(t("reportComponents.improveDefault"));
    }
    return list;
  }, [report, t]);

  if (strengths.length === 0 && improvements.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}> 
      <View style={styles.cardHeader}>
        <Ionicons name="bulb-outline" size={18} color={colors.PRIMARY} />
        <Text style={[styles.cardTitle, { color: colors.TEXT }]}>{t("reportComponents.assessmentTitle")}</Text>
      </View>

      {strengths.map((str, idx) => (
        <View key={`str-${idx}`} style={styles.tipRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.INCOME} style={{ marginTop: 1 }} />
          <Text style={[styles.tipText, { color: colors.TEXT_SECONDARY }]}>{str}</Text>
        </View>
      ))}

      {improvements.map((imp, idx) => (
        <View key={`imp-${idx}`} style={styles.tipRow}>
          <Ionicons name="warning" size={16} color={colors.EXPENSE} style={{ marginTop: 1 }} />
          <Text style={[styles.tipText, { color: colors.TEXT_SECONDARY }]}>{imp}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginVertical: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
