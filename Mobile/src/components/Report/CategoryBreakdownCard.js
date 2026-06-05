import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import { useAppColors } from "../../constants/colors";
import { formatMoney } from "../../utils/format";

export default function CategoryBreakdownCard({ categories }) {
  const colors = useAppColors();
  const { width: screenWidth } = useWindowDimensions();

  if (!categories || categories.length === 0) return null;

  const totalAmount = categories.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  
  // Custom colors preset if category color is not provided
  const categoryPresets = ["#7C4DFF", "#FFB84D", "#22C55E", "#3B82F6", "#EF4444", "#EC4899", "#06B6D4"];

  const pieData = categories.map((item, idx) => ({
    name: item.name || "Khác",
    amount: Number(item.amount || 0),
    color: item.color || categoryPresets[idx % categoryPresets.length],
    legendFontColor: "#FFFFFF",
    legendFontSize: 10
  }));

  const chartWidth = Math.max(screenWidth - 48, 300);

  return (
    <View style={[styles.card, { backgroundColor: colors.CHART_BG || "#1C1C1E", borderColor: "#2C2C2E" }]}> 
      <View style={styles.cardHeader}>
        <Ionicons name="pie-chart-outline" size={18} color="#7C4DFF" />
        <Text style={[styles.cardTitle, { color: "#FFFFFF" }]}>Chi phí theo danh mục</Text>
      </View>

      {/* Donut Chart Container */}
      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          width={chartWidth}
          height={180}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft={(chartWidth / 4).toString()}
          absolute
          hasLegend={false}
          chartConfig={{
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
        />
        {/* Absolute positioned Donut Hole overlay */}
        <View style={[styles.donutHole, { backgroundColor: colors.CHART_BG || "#1C1C1E" }]}>
          <Text style={styles.donutValueText} numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(totalAmount)}
          </Text>
          <Text style={styles.donutLabelText}>Tổng chi</Text>
        </View>
      </View>

      {/* Legend List */}
      <View style={styles.legendContainer}>
        {categories.map((item, idx) => {
          const itemColor = item.color || categoryPresets[idx % categoryPresets.length];
          const percentVal = item.percent || (totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0);
          return (
            <View key={idx} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.legendDot, { backgroundColor: itemColor }]} />
                  <Text style={[styles.categoryName, { color: "#FFFFFF" }]}>{item.name}</Text>
                </View>
                <View style={styles.amountWrap}>
                  <Text style={[styles.categoryAmount, { color: "#FFFFFF" }]}>{formatMoney(item.amount)}</Text>
                  <Text style={[styles.percentText, { color: "rgba(255, 255, 255, 0.6)" }]}>{Math.round(percentVal)}%</Text>
                </View>
              </View>
              {/* Subtle visual progress bar */}
              <View style={[styles.progressContainer, { backgroundColor: "rgba(255, 255, 255, 0.08)" }]}>
                <View style={[styles.progressBar, { width: `${percentVal}%`, backgroundColor: itemColor }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 180,
    marginBottom: 16,
  },
  donutHole: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  donutValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    width: 80,
  },
  donutLabelText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  legendContainer: {
    marginTop: 8,
  },
  categoryItem: {
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
  percentText: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 28,
    textAlign: "right",
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
