import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { COLORS, useAppColors } from "../../constants/colors";
import { formatMoney } from "../../utils/format";

const GRADE_CONFIG = {
  A: { color: COLORS.INCOME, light: COLORS.INCOME_LIGHT, score: 92 },
  B: { color: COLORS.INFO, light: COLORS.INFO_LIGHT, score: 78 },
  C: { color: COLORS.WARNING, light: COLORS.WARNING_LIGHT, score: 62 },
  D: { color: COLORS.PRIMARY, light: COLORS.ROSE_MIST, score: 42 },
  F: { color: COLORS.EXPENSE, light: COLORS.EXPENSE_LIGHT, score: 18 },
};

function getGradeConfig(grade) {
  return GRADE_CONFIG[grade] || GRADE_CONFIG.F;
}

function normalizeSavingsRate(value) {
  const numericValue = Number(value || 0);
  return Math.abs(numericValue) <= 1 ? numericValue * 100 : numericValue;
}

function GradeMeter({ grade }) {
  const config = getGradeConfig(grade);
  const size = 106;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const score = config.score;
  const progressOffset = circumference * (1 - score / 100);

  return (
    <View style={styles.gradeMeterWrap}>
      <Svg width={size} height={size} style={styles.gradeMeterSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={config.light}
          strokeWidth={strokeWidth}
          fill="#FFFFFF"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={config.color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.gradeMeterContent}>
        <Text style={[styles.gradeLetter, { color: config.color }]}>{grade || "F"}</Text>
        <Text style={[styles.gradeScore, { color: config.color }]}>{score} / 100</Text>
      </View>
    </View>
  );
}

function SpendingChangePill({ value, colors }) {
  const { t } = useTranslation();
  const spendingChange = Math.round(Number(value || 0));
  const isIncrease = spendingChange > 0;
  const changeText = spendingChange === 0
    ? t("reportComponents.spendingEquivalent")
    : (isIncrease ? t("reportComponents.spendingIncrease", { percent: Math.abs(spendingChange) }) : t("reportComponents.spendingDecrease", { percent: Math.abs(spendingChange) }));

  return (
    <View style={[styles.spendingPill, { backgroundColor: colors.BG }]}>
      <View style={[styles.spendingPillIcon, { backgroundColor: colors.PRIMARY_LIGHT || colors.ROSE_MIST }]}>
        <Ionicons name="stats-chart-outline" size={16} color={colors.PRIMARY} />
      </View>
      <View style={styles.spendingPillTextWrap}>
        <Text style={[styles.spendingPillTitle, { color: colors.TEXT }]}>
          {changeText}
        </Text>
        <Text style={[styles.spendingPillSub, { color: colors.TEXT_SECONDARY }]}>{t("dashboardComponents.vsLastMonth")}</Text>
      </View>
    </View>
  );
}

function MetricRow({ colors, t: translate, label, value, prevValue, type }) {
  const isIncome = type === "income";
  const color = isIncome ? colors.INCOME : colors.EXPENSE;
  const isSavings = type === "savings";

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricLeft}>
        <Text style={[styles.metricLabel, { color: colors.TEXT }]}>{label}</Text>
        {prevValue !== undefined && (
          <Text style={[styles.prevText, { color: colors.TEXT_MUTED }]}>{translate("reportComponents.lastMonth")}{formatMoney(prevValue)}</Text>
        )}
      </View>
      <Text style={[styles.metricValue, { color: isSavings ? colors.PRIMARY : color }]}>
        {formatMoney(value)}
      </Text>
    </View>
  );
}

export default function ReportMetricCard({ report }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const gradeConfig = getGradeConfig(report.grade);
  const savingsRate = Math.round(normalizeSavingsRate(report.savingsRate));

  return (
    <>
      <View style={[styles.gradeSection, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
        <GradeMeter grade={report.grade} />
        <View style={styles.gradeContent}>
          <View style={styles.gradeTopRow}>
            <Text style={[styles.gradeLabel, { color: gradeConfig.color }]}>
              {t(`reportComponents.grade${report.grade}`) || t("reportComponents.unknownGrade")}
            </Text>
            <View style={[styles.trendIconBox, { backgroundColor: gradeConfig.light }]}>
              <Ionicons
                name={report.spendingChangePercent > 0 ? "trending-down-outline" : "trending-up-outline"}
                size={18}
                color={gradeConfig.color}
              />
            </View>
          </View>
          <Text style={[styles.savingsCaption, { color: colors.TEXT_SECONDARY }]}>{t("reportComponents.savingsRate")}</Text>
          <Text style={[styles.savingsRateText, { color: gradeConfig.color }]}>
            {savingsRate}%
          </Text>
          <SpendingChangePill value={report.spendingChangePercent} colors={colors} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={18} color={colors.PRIMARY} />
          <Text style={[styles.cardTitle, { color: colors.TEXT }]}>{t("reportComponents.financialMetrics")}</Text>
        </View>
        <MetricRow colors={colors} t={t} label={t("reportComponents.totalIncomeLabel")} value={report.totalIncome} prevValue={report.prevMonthIncome} type="income" />
        <MetricRow colors={colors} t={t} label={t("reportComponents.totalExpenseLabel")} value={report.totalExpense} prevValue={report.prevMonthExpense} type="expense" />
        <View style={[styles.divider, { backgroundColor: colors.CARD_BORDER }]} />
        <MetricRow colors={colors} t={t} label={t("reportComponents.accumulatedSavings")} value={report.savings} prevValue={report.prevMonthSavings} type="savings" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  gradeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  gradeMeterWrap: {
    width: 106,
    height: 106,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeMeterSvg: {
    position: "absolute",
  },
  gradeMeterContent: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  gradeLetter: {
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
  },
  gradeScore: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  gradeLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
  },
  gradeContent: {
    flex: 1,
    minWidth: 0,
  },
  gradeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  trendIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  savingsCaption: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  savingsRateText: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "900",
  },
  spendingPill: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  spendingPillIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  spendingPillTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  spendingPillTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  spendingPillSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
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
