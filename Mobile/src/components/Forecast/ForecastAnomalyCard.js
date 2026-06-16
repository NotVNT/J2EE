import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";
import { formatMoney, formatDate } from "../../utils/format";

/**
 * Displays a single anomaly transaction row.
 *
 * @param {object} props
 * @param {object} props.item - Anomaly data { transactionId, categoryName, date, amount, meanAmount }
 */
export default function ForecastAnomalyCard({ item }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const amount = Number(item?.amount || 0);
  const meanAmount = Number(item?.meanAmount || 0);

  const deviation = useMemo(() => {
    if (meanAmount <= 0) return 0;
    return Math.round((amount / meanAmount - 1) * 100);
  }, [amount, meanAmount]);

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.CARD, 
        borderColor: colors.CARD_BORDER,
        borderLeftColor: colors.WARNING 
      }
    ]}> 
      <View style={styles.left}>
        <View style={[styles.warnIconContainer, { backgroundColor: colors.WARNING_LIGHT || "rgba(255,184,77,0.1)" }]}>
          <Ionicons name="warning" size={16} color={colors.WARNING} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.category, { color: colors.TEXT }]}>{item?.categoryName || t("forecastComponents.unknown")}</Text>
          <Text style={[styles.date, { color: colors.TEXT_SECONDARY }]}>{formatDate(item?.date)}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.EXPENSE }]}>{formatMoney(amount)}</Text>
        <Text style={[styles.deviation, { color: colors.WARNING }]}> 
          {deviation > 0 ? t("forecastComponents.higherThan", { percent: deviation }) : t("forecastComponents.anomalyTitle")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  warnIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  category: {
    fontSize: 14,
    fontWeight: "700",
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontWeight: "800",
  },
  deviation: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});
