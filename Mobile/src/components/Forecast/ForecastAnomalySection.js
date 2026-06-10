import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import SectionHeader from "../ui/SectionHeader";
import ForecastAnomalyCard from "./ForecastAnomalyCard";
import ForecastEmptyState from "./ForecastEmptyState";

export default function ForecastAnomalySection({
  anomalies,
  selectedMonth,
  selectedYear,
}) {
  const colors = useAppColors();

  return (
    <View style={styles.section}>
      <SectionHeader 
        title={`Cảnh báo tham khảo tháng ${selectedMonth}/${selectedYear}`} 
      />
      {anomalies.length > 0 ? (
        <View style={styles.anomalyList}>
          {anomalies.map((a) => (
            <ForecastAnomalyCard key={a.transactionId} item={a} />
          ))}
        </View>
      ) : (
        <ForecastEmptyState message="Không phát hiện giao dịch bất thường trong tháng này" />
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
