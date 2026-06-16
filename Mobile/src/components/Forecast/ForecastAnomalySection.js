import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import SectionHeader from "../ui/SectionHeader";
import ForecastAnomalyCard from "./ForecastAnomalyCard";
import ForecastEmptyState from "./ForecastEmptyState";

export default function ForecastAnomalySection({
  anomalies,
  selectedMonth,
  selectedYear,
}) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={styles.section}>
      <SectionHeader 
        title={t("forecastComponents.anomalySectionTitle", { month: selectedMonth, year: selectedYear })} 
      />
      {anomalies.length > 0 ? (
        <View style={styles.anomalyList}>
          {anomalies.map((a) => (
            <ForecastAnomalyCard key={a.transactionId} item={a} />
          ))}
        </View>
      ) : (
        <ForecastEmptyState message={t("forecastComponents.noAnomalies")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  anomalyList: {
    gap: 8,
  },
});
