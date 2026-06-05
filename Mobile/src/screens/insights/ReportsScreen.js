import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useAppColors } from "../../constants/colors";
import { getSafeAreaContentStyle } from "../../utils/safeArea";
import useMonthlyReport from "../../hooks/useMonthlyReport";
import MonthNavigator from "../../components/Report/MonthNavigator";
import ReportMetricCard from "../../components/Report/ReportMetricCard";
import CategoryBreakdownCard from "../../components/Report/CategoryBreakdownCard";
import ReportAdviceCard from "../../components/Report/ReportAdviceCard";
import BudgetGoalProgressCard from "../../components/Report/BudgetGoalProgressCard";
import { fetchExpensesByFilter } from "../../services/expenseService";
import { fetchIncomesByFilter } from "../../services/incomeService";
import { buildReportChartSeries } from "../../utils/financeStats";
import ScreenBackHeader from "../../components/common/ScreenBackHeader";

// ─── Helper ────────────────────────────────────────────────────────────────
const toMillions = (v) => Number((v / 1_000_000).toFixed(2));

const formatCompact = (v) => {
  const m = v / 1_000_000;
  if (m >= 1) return `${m.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} Trđ`;
  const k = v / 1_000;
  if (k >= 1) return `${Math.round(k)}K`;
  return `${Math.round(v)} đ`;
};

// ─── Individual chart mini-card ────────────────────────────────────────────
function MiniChartCard({ title, iconName, accentColor, dataPoints, labels, totalValue, totalLabel, chartWidth }) {
  const colors = useAppColors();
  const isLight = colors.CARD === "#FFFFFF";

  const fromColor = isLight
    ? (accentColor === "#FF5A5A" ? "#FFF2F2" : "#EAFDF7")
    : (accentColor === "#FF5A5A" ? "#211212" : "#0E1D18");
  const midColor = colors.CARD || "#1C1C1E";

  const chartConfig = {
    backgroundGradientFrom: fromColor,
    backgroundGradientTo: midColor,
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    decimalPlaces: 1,
    color: () => accentColor,
    labelColor: () => isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.45)",
    barPercentage: 0.55,
    fillShadowGradient: accentColor,
    fillShadowGradientOpacity: 0.9,
    propsForBackgroundLines: {
      strokeDasharray: "4 3",
      stroke: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)",
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 9.5,
      fontWeight: "600",
    },
  };

  return (
    <View style={[styles.miniCard, { backgroundColor: fromColor, borderColor: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", borderWidth: 1 }]}>
      {/* Mini-card header */}
      <View style={styles.miniCardHeader}>
        <View style={[styles.miniCardIconWrap, { backgroundColor: accentColor + "22" }]}>
          <Ionicons name={iconName} size={15} color={accentColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.miniCardTitle, { color: colors.TEXT }]}>{title}</Text>
          <Text style={[styles.miniCardSubtitle, { color: colors.TEXT_SECONDARY }]}>Đơn vị: Triệu đồng (Trđ)</Text>
        </View>
        {/* Total badge */}
        <View style={[styles.totalBadge, { backgroundColor: accentColor + "1A", borderColor: accentColor + "44" }]}>
          <Text style={[styles.totalBadgeValue, { color: accentColor }]} numberOfLines={1} adjustsFontSizeToFit>
            {totalValue}
          </Text>
          <Text style={[styles.totalBadgeLabel, { color: accentColor + "88" }]}>{totalLabel}</Text>
        </View>
      </View>

      {/* Bar chart */}
      <BarChart
        data={{
          labels,
          datasets: [{ data: dataPoints.map((point) => toMillions(point.value)) }],
        }}
        width={chartWidth}
        height={145}
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
        withInnerLines
        style={styles.barChartStyle}
      />

      {/* Weekly breakdown summary */}
      <View style={[styles.weekRow, { borderTopColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)" }]}>
        {dataPoints.map((point) => (
          <View key={point.key} style={styles.weekCell}>
            <Text
              style={[
                styles.weekCellValue,
                { color: point.value > 0 ? accentColor : (isLight ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.18)") },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {point.value > 0 ? formatCompact(point.value) : "–"}
            </Text>
            <Text style={[styles.weekCellLabel, { color: colors.TEXT_MUTED }]}>{point.summaryLabel}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main chart container card ──────────────────────────────────────────────
const CHART_RANGE_OPTIONS = [
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
  { key: "sixMonths", label: "6 tháng" },
];

function ChartRangeSegment({ activeRange, onChange }) {
  const colors = useAppColors();
  const isLight = colors.CARD === "#FFFFFF";

  return (
    <View style={[styles.rangeSegment, { backgroundColor: isLight ? "#F4EEF1" : "rgba(255,255,255,0.06)" }]}>
      {CHART_RANGE_OPTIONS.map((option) => {
        const active = activeRange === option.key;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={`Xem biểu đồ theo ${option.label}`}
            onPress={() => onChange(option.key)}
            style={({ pressed }) => [
              styles.rangeButton,
              active && [
                styles.rangeButtonActive,
                { backgroundColor: colors.CARD, shadowColor: colors.SHADOW_COLOR || "#000" }
              ],
              pressed && styles.rangeButtonPressed,
            ]}
          >
            <Text style={[styles.rangeButtonText, { color: active ? colors.TEXT : colors.TEXT_SECONDARY }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ReportsChartCard({ expenses, incomes, selectedMonth, selectedYear }) {
  const colors = useAppColors();
  const { width: screenWidth } = useWindowDimensions();
  const [chartRange, setChartRange] = useState("month");
  const chartSeries = useMemo(
    () => buildReportChartSeries({ expenses, incomes, selectedMonth, selectedYear, range: chartRange }),
    [chartRange, expenses, incomes, selectedMonth, selectedYear]
  );

  // Leave 32px margin each side inside outer card
  const chartWidth = Math.max(screenWidth - 80, 260);

  return (
    <View style={[styles.outerCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
      {/* Outer header */}
      <View style={[styles.outerHeader, { borderBottomColor: colors.CARD_BORDER }]}>
        <View style={styles.outerHeaderCopy}>
          <View style={[styles.outerHeaderIconWrap, { backgroundColor: colors.PRIMARY + "15" }]}>
            <Ionicons name="bar-chart-outline" size={18} color={colors.PRIMARY} />
          </View>
          <View style={styles.outerHeaderText}>
            <Text style={[styles.outerHeaderTitle, { color: colors.TEXT }]}>{chartSeries.title}</Text>
            <Text style={[styles.outerHeaderSub, { color: colors.TEXT_SECONDARY }]}>{chartSeries.subtitle}</Text>
          </View>
        </View>
        <ChartRangeSegment activeRange={chartRange} onChange={setChartRange} />
      </View>

      {/* Expense mini-card */}
      <MiniChartCard
        title="Chi tiêu"
        iconName="trending-down-outline"
        accentColor="#FF5A5A"
        dataPoints={chartSeries.expense}
        labels={chartSeries.labels}
        totalValue={formatCompact(chartSeries.expenseTotal)}
        totalLabel={chartSeries.totalLabel}
        chartWidth={chartWidth}
      />

      {/* Income mini-card */}
      <MiniChartCard
        title="Thu nhập"
        iconName="trending-up-outline"
        accentColor="#2DD4A0"
        dataPoints={chartSeries.income}
        labels={chartSeries.labels}
        totalValue={formatCompact(chartSeries.incomeTotal)}
        totalLabel={chartSeries.totalLabel}
        chartWidth={chartWidth}
      />
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const {
    selectedMonth,
    selectedYear,
    report,
    loading,
    error,
    goToPrevMonth,
    goToNextMonth,
  } = useMonthlyReport();

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const shouldShowBackHeader = route.name !== "CategoryMain";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const [expRes, incRes] = await Promise.all([
          fetchExpensesByFilter("all"),
          fetchIncomesByFilter("all"),
        ]);
        setExpenses(expRes);
        setIncomes(incRes);
      } catch (err) {
        console.warn("Could not fetch reports raw data:", err);
      }
    };
    fetchTransactions();
  }, [selectedMonth, selectedYear]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.APP_BACKGROUND || "#F2F2F7" }]}
      contentContainerStyle={[styles.content, getSafeAreaContentStyle(insets)]}
      showsVerticalScrollIndicator={false}
    >
      {shouldShowBackHeader ? <ScreenBackHeader title="Thống kê" /> : null}

      <MonthNavigator
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>
            Đang lập báo cáo chi tiết...
          </Text>
        </View>
      ) : error || !report ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={[styles.errorText, { color: colors.TEXT_SECONDARY }]}>
            {error || "Chưa có dữ liệu giao dịch trong tháng này để tạo báo cáo."}
          </Text>
        </View>
      ) : (
        <View style={styles.reportContainer}>
          <ReportMetricCard report={report} />
          <ReportsChartCard
            expenses={expenses}
            incomes={incomes}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
          <CategoryBreakdownCard categories={report.categoryBreakdown} />
          <ReportAdviceCard
            strengths={report.strengths}
            improvements={report.improvements}
          />
          <BudgetGoalProgressCard
            budgetsOnTrack={report.budgetsOnTrack}
            totalBudgets={report.totalBudgets}
            completedGoalsThisMonth={report.completedGoalsThisMonth}
          />
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Screen
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 88 },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  reportContainer: { gap: 16 },

  // Outer card
  outerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  outerHeader: {
    alignItems: "stretch",
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  outerHeaderCopy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  outerHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  outerHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  outerHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  outerHeaderSub: {
    fontSize: 11,
    marginTop: 1,
  },
  rangeSegment: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
  },
  rangeButton: {
    flex: 1,
    minHeight: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  rangeButtonActive: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  rangeButtonPressed: {
    opacity: 0.78,
  },
  rangeButtonText: {
    fontSize: 11,
    fontWeight: "800",
  },

  // Mini card
  miniCard: {
    borderRadius: 14,
    overflow: "hidden",
    paddingTop: 12,
    paddingRight: 0,
    paddingBottom: 10,
    paddingLeft: 12,
  },
  miniCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    paddingRight: 12,
  },
  miniCardIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCardTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  miniCardSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },

  // Total badge
  totalBadge: {
    marginLeft: "auto",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    minWidth: 64,
  },
  totalBadgeValue: {
    fontSize: 12,
    fontWeight: "800",
  },
  totalBadgeLabel: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 1,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // Chart
  barChartStyle: {
    borderRadius: 10,
    marginLeft: -8,
  },

  // Weekly breakdown row
  weekRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 10,
    paddingRight: 12,
  },
  weekCell: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  weekCellValue: {
    fontSize: 10,
    fontWeight: "700",
  },
  weekCellLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
});
