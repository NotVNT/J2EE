import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import { formatDate, formatMoney } from "../../utils/format";
import { scale } from "../../utils/layoutScale";

export default function ReceiptSummaryCard({ itemCount, location, merchant, receiptDate, totalAmount }) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
      <Text style={[styles.summaryTitle, { color: colors.TEXT }]}>🧾 {merchant || t("receiptItem.receiptLabel")}</Text>
      {location ? <Text style={[styles.summaryLocation, { color: colors.TEXT_SECONDARY }]}>📍 {location}</Text> : null}
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryDate, { color: colors.TEXT_SECONDARY }]}>📅 {formatDate(receiptDate)}</Text>
        <Text style={[styles.summaryCount, { color: colors.PRIMARY }]}>{t("receiptItem.itemsCount", { count: itemCount })}</Text>
      </View>
      <Text style={[styles.summaryTotal, { color: colors.EXPENSE_COLOR || colors.EXPENSE }]}>{t("receiptItem.totalLabel")} {formatMoney(totalAmount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    margin: scale(16),
    marginBottom: scale(4),
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(16)
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: scale(4)
  },
  summaryLocation: {
    fontSize: 13,
    marginBottom: scale(6)
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(8)
  },
  summaryDate: {
    fontSize: 13,
  },
  summaryCount: {
    fontSize: 13,
    fontWeight: "600"
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: "800",
  }
});
