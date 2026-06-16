import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";
import { INCOME_FILTER_TYPES } from "../../hooks/useIncomes";
import { formatMoney } from "../../utils/format";
import VoiceInputButton from "../common/VoiceInputButton";

const MIC_ICON = require("../../assets/accessories/mic.png");

export default function IncomeSummaryCard({
  filterType,
  incomeCount,
  isExporting,
  onAddIncome,
  onExport,
  onVoiceResult,
  totalIncome
}) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, shadowColor: colors.TEXT }]}>
      <View style={styles.summaryContent}>
        <Text style={[styles.summaryLabel, { color: colors.TEXT_SECONDARY }]}>{t("incomeSummary.totalIncome")}</Text>
        <Text style={[styles.summaryAmount, { color: colors.INCOME }]}>{formatMoney(totalIncome)}</Text>
        <Text style={[styles.summaryHint, { color: colors.TEXT_SECONDARY }]}>{incomeCount} {t("incomeSummary.transactions")}</Text>
      </View>

      <View style={styles.actionRowMain}>
        <Pressable style={[styles.addButtonMain, { backgroundColor: colors.ACTION_INCOME || colors.INCOME }]} onPress={onAddIncome}>
          <Text style={styles.addButtonText}>+ {t("incomeSummary.addIncome")}</Text>
        </Pressable>
        <VoiceInputButton iconSource={MIC_ICON} noBackground onResult={onVoiceResult} />
      </View>
      <Pressable
        style={[styles.exportButton, { backgroundColor: colors.BG, borderColor: colors.INCOME_LIGHT }, isExporting && styles.exportButtonDisabled]}
        onPress={onExport}
        disabled={isExporting}
      >
        <Text style={[styles.exportText, { color: colors.ACTION_INCOME || colors.INCOME }]}>
          {isExporting
            ? t("incomeSummary.generating")
            : filterType === INCOME_FILTER_TYPES.all
              ? t("incomeSummary.downloadAll")
              : t("incomeSummary.downloadMonth")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    padding: 14,
    marginBottom: 14,
    shadowColor: COLORS.TEXT,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2
  },
  summaryContent: {
    alignItems: "center"
  },
  summaryLabel: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "700"
  },
  summaryAmount: {
    marginTop: 4,
    fontSize: 26,
    color: COLORS.INCOME,
    fontWeight: "800"
  },
  summaryHint: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY
  },
  actionRowMain: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    alignItems: "center"
  },
  addButtonMain: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  addButtonText: {
    color: COLORS.WHITE,
    fontWeight: "800",
    fontSize: 15
  },
  exportButton: {
    backgroundColor: COLORS.BG,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_LIGHT
  },
  exportButtonDisabled: {
    opacity: 0.7
  },
  exportText: {
    color: COLORS.PRIMARY,
    fontWeight: "700",
    fontSize: 14
  }
});
