import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";
import { COLORS, useAppColors } from "../../constants/colors";
import { getSafeAreaContentStyle } from "../../utils/safeArea";
import useMonthlyReport from "../../hooks/useMonthlyReport";
import MonthNavigator from "../../components/Report/MonthNavigator";
import ReportMetricCard from "../../components/Report/ReportMetricCard";
import CategoryBreakdownCard from "../../components/Report/CategoryBreakdownCard";
import ReportAdviceCard from "../../components/Report/ReportAdviceCard";
import BudgetGoalProgressCard from "../../components/Report/BudgetGoalProgressCard";
import { fetchExpensesByFilter } from "../../services/expenseService";
import { fetchIncomesByFilter } from "../../services/incomeService";

function ReportsChartCard({ expenses, incomes, selectedMonth, selectedYear }) {
  const colors = useAppColors();
  const { width: screenWidth } = useWindowDimensions();

  const weeklyExpense = [0, 0, 0, 0, 0];
  const weeklyIncome = [0, 0, 0, 0, 0];

  expenses.forEach(tx => {
    const txDate = new Date(tx.createdAt || tx.date);
    if (txDate.getFullYear() === selectedYear && (txDate.getMonth() + 1) === selectedMonth) {
      const day = txDate.getDate();
      if (day <= 7) weeklyExpense[0] += Number(tx.amount || 0);
      else if (day <= 14) weeklyExpense[1] += Number(tx.amount || 0);
      else if (day <= 21) weeklyExpense[2] += Number(tx.amount || 0);
      else if (day <= 28) weeklyExpense[3] += Number(tx.amount || 0);
      else weeklyExpense[4] += Number(tx.amount || 0);
    }
  });

  incomes.forEach(tx => {
    const txDate = new Date(tx.createdAt || tx.date);
    if (txDate.getFullYear() === selectedYear && (txDate.getMonth() + 1) === selectedMonth) {
      const day = txDate.getDate();
      if (day <= 7) weeklyIncome[0] += Number(tx.amount || 0);
      else if (day <= 14) weeklyIncome[1] += Number(tx.amount || 0);
      else if (day <= 21) weeklyIncome[2] += Number(tx.amount || 0);
      else if (day <= 28) weeklyIncome[3] += Number(tx.amount || 0);
      else weeklyIncome[4] += Number(tx.amount || 0);
    }
  });

  // Convert values to millions (tr) to make charts readable
  const toMillions = (v) => Number((v / 1000000).toFixed(1));

  const chartWidth = Math.max(screenWidth - 48, 300);

  const getChartConfig = (barColor) => ({
    backgroundColor: colors.CHART_BG || "#1C1C1E",
    backgroundGradientFrom: colors.CHART_BG || "#1C1C1E",
    backgroundGradientTo: colors.CHART_BG || "#1C1C1E",
    decimalPlaces: 1,
    color: () => barColor,
    labelColor: () => "rgba(255, 255, 255, 0.6)",
    barPercentage: 0.55,
    propsForBackgroundLines: {
      strokeDasharray: "4 4",
      stroke: "rgba(255, 255, 255, 0.1)",
    },
  });

  return (
    <View style={[styles.chartContainerCard, { backgroundColor: colors.CHART_BG || "#1C1C1E", borderColor: "#2C2C2E" }]}>
      {/* Expense Bar Chart */}
      <View style={styles.chartBlock}>
        <Text style={styles.chartBlockTitle}>Chi phí (Trđ)</Text>
        <BarChart
          data={{
            labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5"],
            datasets: [{ data: weeklyExpense.map(toMillions) }]
          }}
          width={chartWidth}
          height={160}
          chartConfig={getChartConfig("#EF4444")}
          fromZero
          showValuesOnTopOfBars
          style={styles.barChartStyle}
        />
      </View>

      {/* Income Bar Chart */}
      <View style={[styles.chartBlock, { marginTop: 16 }]}>
        <Text style={styles.chartBlockTitle}>Thu nhập (Trđ)</Text>
        <BarChart
          data={{
            labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5"],
            datasets: [{ data: weeklyIncome.map(toMillions) }]
          }}
          width={chartWidth}
          height={160}
          chartConfig={getChartConfig("#22C55E")}
          fromZero
          showValuesOnTopOfBars
          style={styles.barChartStyle}
        />
      </View>
    </View>
  );
}

export default function ReportsScreen() {
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

  // Fetch underlying transactions to feed the bar charts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const [expRes, incRes] = await Promise.all([
          fetchExpensesByFilter("all"),
          fetchIncomesByFilter("all")
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
      <MonthNavigator
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>Đang lập báo cáo chi tiết...</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  reportContainer: {
    gap: 16,
  },
  chartContainerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 8,
  },
  chartBlock: {
    width: "100%",
  },
  chartBlockTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    paddingLeft: 4,
  },
  barChartStyle: {
    borderRadius: 12,
    paddingRight: 12,
  },
});
