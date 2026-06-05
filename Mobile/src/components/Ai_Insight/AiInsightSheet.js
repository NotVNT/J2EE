import React, { useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import AiInsightForecastResult from "./AiInsightForecastResult";
import AiInsightMonthNavigator from "./AiInsightMonthNavigator";
import AiInsightStateBlock from "./AiInsightStateBlock";
import AppIcon from "../ui/AppIcon";
import { scale } from "../../utils/layoutScale";

export default function AiInsightSheet({
  availableMonths = [],
  canGoNext,
  canGoPrev,
  error,
  goToNextMonth,
  goToPrevMonth,
  isIdle,
  isPremium,
  loading,
  onAnalyze,
  onClose,
  onConfirm,
  onRetry,
  result,
  selectedMonth,
  selectedYear,
  visible
}) {
  const colors = useAppColors();

  const monthLabel = useMemo(() => {
    const selected = (availableMonths || []).find(
      (month) => month.month === selectedMonth && month.year === selectedYear
    );
    return selected ? selected.label : `Tháng ${selectedMonth}/${selectedYear}`;
  }, [availableMonths, selectedMonth, selectedYear]);

  const hasData = Boolean(result);

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={[styles.sheet, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
          <View style={[styles.header, { borderBottomColor: colors.CARD_BORDER }]}>
            <View style={styles.headerLeft}>
              <AppIcon name="sparkles-outline" size={18} color={colors.PRIMARY} />
              <Text style={[styles.headerTitle, { color: colors.TEXT }]}>AI Insight</Text>
            </View>
            <Pressable style={[styles.closeBtn, { backgroundColor: colors.BG }]} onPress={onClose} hitSlop={10}>
              <AppIcon name="close" size={18} color={colors.TEXT_SECONDARY} />
            </Pressable>
          </View>

          {/* Setting flex: 1 on ScrollView to ensure proper height constraint and scrolling */}
          <ScrollView 
            style={styles.body} 
            contentContainerStyle={styles.bodyContent} 
            showsVerticalScrollIndicator={true}
          >
            <AiInsightMonthNavigator
              canGoNext={canGoNext}
              canGoPrev={canGoPrev}
              disabled={loading}
              goToNextMonth={goToNextMonth}
              goToPrevMonth={goToPrevMonth}
              monthLabel={monthLabel}
            />

            {isPremium && isIdle ? (
              <Text style={[styles.idleText, { color: colors.TEXT_SECONDARY }]}>
                AI sẽ dùng dữ liệu các tháng trước để dự báo hành vi tài chính cho {monthLabel}.
              </Text>
            ) : null}

            {!isPremium ? (
              <View style={[styles.stateBox, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
                <AppIcon name="lock-closed-outline" size={26} color={colors.PRIMARY} style={{ marginBottom: 4 }} />
                <Text style={[styles.stateText, { color: colors.TEXT_SECONDARY }]}>
                  Tính năng AI Insight cần gói Premium.
                </Text>
              </View>
            ) : null}

            {isPremium && !hasData && !loading ? (
              <Pressable style={[styles.analyzeBtn, { backgroundColor: colors.PRIMARY }]} onPress={onAnalyze}>
                <Text style={styles.analyzeBtnText}>✨ Phân tích</Text>
              </Pressable>
            ) : null}

            <AiInsightStateBlock error={error} loading={loading} onRetry={onRetry} />

            {hasData && !loading && !error ? (
              <AiInsightForecastResult
                onClose={onClose}
                onConfirm={onConfirm}
                onRetry={onRetry}
                result={result}
              />
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)"
  },
  sheet: {
    borderRadius: scale(20),
    height: "75%", // Fixed height percentage to avoid circular flex collapse
    width: "92%",
    borderWidth: 1,
    overflow: "hidden"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800"
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  body: {
    flex: 1 // Crucial: forces ScrollView to scroll inside the constrained sheet height
  },
  bodyContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 24
  },
  idleText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20
  },
  analyzeBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },
  analyzeBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  stateBox: {
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8
  },
  stateText: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 12
  }
});
