import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";

export default function ForecastBarChart({ barChartData, categories }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max(screenWidth - 48, 300);
  const chartConfig = {
    backgroundColor: colors.CARD,
    backgroundGradientFrom: colors.CARD,
    backgroundGradientTo: colors.CARD,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(232, 89, 122, ${opacity})`,
    labelColor: () => colors.TEXT_SECONDARY,
    barPercentage: 0.5,
    propsForLabels: { fontSize: 10 },
    propsForBackgroundLines: {
      strokeDasharray: "4 4",
      stroke: colors.CARD_BORDER,
      strokeWidth: 1,
    },
  };

  if (!barChartData || categories.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>{t("forecastComponents.barChartTitle")}</Text>
      <View style={[styles.chartCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}> 
        <BarChart
          data={barChartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix="đ"
        />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.PRIMARY }]} />
            <Text style={[styles.legendText, { color: colors.TEXT_SECONDARY }]}>{t("forecastComponents.barLegendForecast")}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.INFO }]} />
            <Text style={[styles.legendText, { color: colors.TEXT_SECONDARY }]}>{t("forecastComponents.barLegendAvg")}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  chart: {
    borderRadius: 12,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
