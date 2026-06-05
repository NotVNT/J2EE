import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import { formatInsightMoney, getTrendColor, getTrendText } from "./aiInsightFormatters";
import AppIcon from "../ui/AppIcon";
import { LinearGradient } from "expo-linear-gradient";
import { scale } from "../../utils/layoutScale";

export default function AiInsightForecastResult({ onClose, onConfirm, onRetry, result }) {
  const colors = useAppColors();
  const categories = result?.categories || [];
  const anomalies = result?.anomalies || [];
  const topRiskCategory = result?.topRiskCategory;

  if (!result) {
    return null;
  }

  return (
    <View style={styles.results}>
      <Text style={[styles.kicker, { color: colors.PRIMARY }]}>
        Dự báo tháng {result.month}/{result.year}
      </Text>

      {/* Main Expected Expense Row */}
      <View style={[styles.totalRow, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
        <Text style={[styles.totalLabel, { color: colors.TEXT_SECONDARY }]}>Tổng chi tiêu dự kiến</Text>
        <Text style={[styles.totalValue, { color: colors.EXPENSE_COLOR || colors.EXPENSE }]}>
          {formatInsightMoney(result.totalPredictedExpense)}
        </Text>
      </View>

      {/* Top Risk Warning Card */}
      {topRiskCategory ? (
        <View style={[styles.riskRow, { backgroundColor: colors.WARNING_LIGHT || "#FFF8E1", borderColor: colors.WARNING || "#FFE082" }]}>
          <AppIcon name="warning-outline" size={18} color={colors.WARNING || "#FFB84D"} style={styles.riskIcon} />
          <View style={styles.riskBody}>
            <Text style={[styles.riskLabel, { color: colors.TEXT_SECONDARY }]}>Danh mục có nguy cơ tăng mạnh</Text>
            <Text style={[styles.riskName, { color: colors.TEXT }]}>{topRiskCategory.categoryName}</Text>
            <Text style={[styles.riskDetail, { color: colors.TEXT_MUTED }]}>
              Dự kiến: {formatInsightMoney(topRiskCategory.predictedAmount)} · {getTrendText(topRiskCategory.trend)}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Anomalies Card */}
      {anomalies.length > 0 ? (
        <View style={[styles.anomalyRow, { backgroundColor: colors.EXPENSE_LIGHT || "#FFEBEE", borderColor: colors.EXPENSE_COLOR || "#FFCDD2" }]}>
          <AppIcon name="alert-circle-outline" size={16} color={colors.EXPENSE_COLOR || colors.EXPENSE} style={styles.anomalyIcon} />
          <Text style={[styles.anomalyText, { color: colors.EXPENSE_COLOR || colors.EXPENSE }]}>
            Phát hiện {anomalies.length} giao dịch bất thường
          </Text>
        </View>
      ) : null}

      {/* Categories Forecast List */}
      {categories.length > 0 ? (
        <View style={[styles.catSection, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Dự báo theo danh mục</Text>
          {categories.slice(0, 6).map((category, index) => (
            <View key={category.categoryId || index} style={[styles.catRow, { borderBottomColor: colors.CARD_BORDER }]}>
              <View style={[styles.dot, { backgroundColor: getTrendColor(category.trend) }]} />
              <Text style={[styles.catName, { color: colors.TEXT }]}>{category.categoryName}</Text>
              <Text style={[styles.catAmount, { color: colors.TEXT }]}>{formatInsightMoney(category.predictedAmount)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* AI Narrative Analysis Card */}
      {result.narrative ? (
        <View style={[styles.narrativeBox, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
          <View style={styles.narrativeHeader}>
            <AppIcon name="sparkles-outline" size={14} color={colors.PRIMARY} style={{ marginRight: 6 }} />
            <Text style={[styles.narrativeTitle, { color: colors.TEXT }]}>Phân tích AI</Text>
          </View>
          <Text style={[styles.narrativeText, { color: colors.TEXT_SECONDARY }]}>{result.narrative}</Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable 
          style={({ pressed }) => [
            styles.actionBtn, 
            styles.reBtn, 
            { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER },
            pressed && { opacity: 0.8 }
          ]} 
          onPress={onRetry}
        >
          <Text style={[styles.reBtnText, { color: colors.PRIMARY }]}>Phân tích lại</Text>
        </Pressable>
        
        <Pressable 
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && { opacity: 0.85 }
          ]} 
          onPress={onConfirm || onClose}
        >
          <LinearGradient
            colors={['#7C4DFF', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmGradient}
          >
            <Text style={styles.confirmBtnText}>Xác nhận</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  results: {
    gap: 12
  },
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center"
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600"
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "800"
  },
  riskRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1
  },
  riskIcon: {
    marginTop: 2
  },
  riskBody: {
    flex: 1
  },
  riskLabel: {
    fontSize: 11,
    fontWeight: "600"
  },
  riskName: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2
  },
  riskDetail: {
    fontSize: 11,
    marginTop: 2
  },
  anomalyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1
  },
  anomalyIcon: {
    marginTop: 0
  },
  anomalyText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600"
  },
  catSection: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  catName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600"
  },
  catAmount: {
    fontSize: 13,
    fontWeight: "700"
  },
  narrativeBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1
  },
  narrativeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  narrativeTitle: {
    fontSize: 13,
    fontWeight: "700"
  },
  narrativeText: {
    fontSize: 13,
    lineHeight: 20
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6
  },
  actionBtn: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    overflow: "hidden"
  },
  reBtn: {
    borderWidth: 1
  },
  reBtnText: {
    fontSize: 14,
    fontWeight: "800"
  },
  confirmGradient: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  confirmBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "800"
  }
});
