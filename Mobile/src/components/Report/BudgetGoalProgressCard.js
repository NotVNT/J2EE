import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";

export default function BudgetGoalProgressCard({ budgetsOnTrack, totalBudgets, completedGoalsThisMonth }) {
  const colors = useAppColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}> 
      <View style={styles.cardHeader}>
        <Ionicons name="pie-chart-outline" size={18} color={colors.PRIMARY} />
        <Text style={[styles.cardTitle, { color: colors.TEXT }]}>Tiến độ ngân sách & mục tiêu</Text>
      </View>
      <View style={styles.goalStatusRow}>
        <View style={styles.goalStatusItem}>
          <Text style={[styles.goalStatusValue, { color: colors.PRIMARY }]}>{budgetsOnTrack} / {totalBudgets}</Text>
          <Text style={[styles.goalStatusLabel, { color: colors.TEXT_SECONDARY }]}>Ngân sách an toàn</Text>
        </View>
        <View style={[styles.verticalDivider, { backgroundColor: colors.CARD_BORDER }]} />
        <View style={styles.goalStatusItem}>
          <Text style={[styles.goalStatusValue, { color: colors.PRIMARY }]}>{completedGoalsThisMonth}</Text>
          <Text style={[styles.goalStatusLabel, { color: colors.TEXT_SECONDARY }]}>Mục tiêu hoàn thành</Text>
        </View>
      </View>
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
  goalStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalStatusItem: {
    flex: 1,
    alignItems: "center",
  },
  goalStatusValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  goalStatusLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  verticalDivider: {
    width: 1,
    height: 32,
  },
});
