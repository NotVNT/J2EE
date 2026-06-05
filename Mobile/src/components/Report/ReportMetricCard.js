import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";
import { formatMoney } from "../../utils/format";

function GradeBadge({ grade, label }) {
  const getGradeColor = (g) => {
    switch (g) {
      case "A": return { text: COLORS.INCOME, bg: COLORS.INCOME_LIGHT };
      case "B": return { text: COLORS.INFO, bg: COLORS.INFO_LIGHT };
      case "C": return { text: COLORS.WARNING, bg: COLORS.WARNING_LIGHT };
      case "D": return { text: COLORS.PRIMARY, bg: COLORS.ROSE_MIST };
      case "F":
      default: return { text: COLORS.EXPENSE, bg: COLORS.EXPENSE_LIGHT };
    }
  };

  const colors = getGradeColor(grade);

  return (
    <View style={[styles.gradeCard, { backgroundColor: colors.bg, borderColor: colors.text }]}>
      <Text style={[styles.gradeLetter, { color: colors.text }]}>{grade || "C"}</Text>
      <Text style={[styles.gradeLabel, { color: colors.text }]}>{label || "Khá"}</Text>
    </View>
  );
}

function MetricRow({ colors, label, value, prevValue, type }) {
  const isIncome = type === "income";
  const color = isIncome ? colors.INCOME : colors.EXPENSE;
  const isSavings = type === "savings";

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricLeft}>
        <Text style={[styles.metricLabel, { color: colors.TEXT }]}>{label}</Text>
        {prevValue !== undefined && (
          <Text style={[styles.prevText, { color: colors.TEXT_MUTED }]}>Tháng trước: {formatMoney(prevValue)}</Text>
        )}
      </View>
      <Text style={[styles.metricValue, { color: isSavings ? colors.PRIMARY : color }]}> 
        {formatMoney(value)}
      </Text>
    </View>
  );
}

export default function ReportMetricCard({ report }) {
  const colors = useAppColors();

  return (
    <>
      <View style={[styles.gradeSection, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}> 
        <GradeBadge grade={report.grade} label={report.gradeLabel} />
        <View style={styles.gradeIntro}>
          <Text style={[styles.savingsRateText, { color: colors.TEXT }]}> 
            Tỷ lệ tiết kiệm: {Math.round(report.savingsRate * 100)}%
          </Text>
          <Text style={[styles.spendingChangeText, { color: colors.TEXT_SECONDARY }]}> 
            {report.spendingChangePercent > 0
              ? `Chi tiêu tăng ${Math.round(report.spendingChangePercent)}% so với tháng trước`
              : report.spendingChangePercent < 0
                ? `Chi tiêu giảm ${Math.round(Math.abs(report.spendingChangePercent))}% so với tháng trước`
                : "Mức chi tiêu tương đương tháng trước"}
          </Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}> 
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={18} color={colors.PRIMARY} />
          <Text style={[styles.cardTitle, { color: colors.TEXT }]}>Chỉ số tài chính</Text>
        </View>
        <MetricRow colors={colors} label="Tổng thu nhập" value={report.totalIncome} prevValue={report.prevMonthIncome} type="income" />
        <MetricRow colors={colors} label="Tổng chi tiêu" value={report.totalExpense} prevValue={report.prevMonthExpense} type="expense" />
        <View style={[styles.divider, { backgroundColor: colors.CARD_BORDER }]} />
        <MetricRow colors={colors} label="Tiết kiệm tích lũy" value={report.savings} prevValue={report.prevMonthSavings} type="savings" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  gradeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
  gradeCard: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeLetter: {
    fontSize: 30,
    fontWeight: "900",
  },
  gradeLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: -2,
  },
  gradeIntro: {
    flex: 1,
  },
  savingsRateText: {
    fontSize: 16,
    fontWeight: "800",
  },
  spendingChangeText: {
    fontSize: 12,
    marginTop: 4,
  },
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
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  metricLeft: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: "750",
  },
  prevText: {
    fontSize: 11,
    marginTop: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
});
