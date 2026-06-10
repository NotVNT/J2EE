import React, { useCallback, useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppColors } from "../../constants/colors";
import AiInsightForecastResult from "./AiInsightForecastResult";
import AiInsightStateBlock from "./AiInsightStateBlock";
import ForecastMonthPicker from "../Forecast/ForecastMonthPicker";
import AppIcon from "../ui/AppIcon";
import { scale } from "../../utils/layoutScale";

export default function AiInsightSheet({
  availableMonths = [],
  canGoNext,
  canGoPrev,
  error,
  goToMonth,
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
  const [pickerVisible, setPickerVisible] = useState(false);

  const monthLabel = useMemo(() => {
    const selected = (availableMonths || []).find(
      (month) => month.month === selectedMonth && month.year === selectedYear
    );
    return selected ? selected.label : `Tháng ${selectedMonth}/${selectedYear}`;
  }, [availableMonths, selectedMonth, selectedYear]);

  const handleMonthSelect = useCallback((month, year) => {
    setPickerVisible(false);
    goToMonth(month, year);
  }, [goToMonth]);

  const hasData = Boolean(result);

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER, shadowColor: colors.SHADOW_COLOR || "#000" }]}>
          <View style={[styles.header, { borderBottomColor: colors.CARD_BORDER }]}>
            <View style={styles.headerLeft}>
              <Image source={require("../../assets/ai-insight/ai-insight.png")} style={styles.headerIconImg} />
              <View>
                <Text style={[styles.headerTitle, { color: colors.TEXT }]}>AI Insight</Text>
                <Text style={[styles.headerSubtitle, { color: colors.TEXT_SECONDARY }]}>Dự báo hành vi tài chính</Text>
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={true}
          >
            <ForecastMonthPicker
              accessibilityLabel="Chọn tháng dự báo AI Insight"
              label={monthLabel}
              visible={pickerVisible}
              options={availableMonths}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onOpen={() => setPickerVisible(true)}
              onSelect={handleMonthSelect}
              onClose={() => setPickerVisible(false)}
            />

            {isPremium && isIdle ? (
              <View style={[styles.infoCard, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
                <Image source={require("../../assets/ai-insight/analyzing.png")} style={styles.infoIconImg} />
                <View style={styles.infoTextWrap}>
                  <Text style={[styles.infoTitle, { color: colors.TEXT }]}>Sẵn sàng phân tích</Text>
                  <Text style={[styles.idleText, { color: colors.TEXT_SECONDARY }]}>
                    AI sẽ dùng dữ liệu các tháng trước để dự báo hành vi tài chính cho {monthLabel}.
                  </Text>
                </View>
              </View>
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
                <LinearGradient
                  colors={[colors.PRIMARY || "#E8597A", colors.ACTION_VOICE || "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.analyzeGradient}
                >
                  <Image source={require("../../assets/ai-insight/pointing-finger.png")} style={styles.analyzeBtnIcon} />
                  <Text style={styles.analyzeBtnText}>Phân tích</Text>
                </LinearGradient>
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
    backgroundColor: "rgba(0, 0, 0, 0.58)"
  },
  sheet: {
    borderRadius: scale(24),
    maxHeight: "90%",
    width: "92%",
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  headerIconImg: {
    width: 34,
    height: 34,
    resizeMode: "contain"
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "900"
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600"
  },

  body: {
    flexShrink: 1
  },
  bodyContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 24
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 11
  },
  infoIconImg: {
    width: 42,
    height: 42,
    resizeMode: "contain"
  },
  infoTextWrap: {
    flex: 1,
    minWidth: 0
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "850",
    marginBottom: 3
  },
  idleText: {
    fontSize: 12,
    lineHeight: 18
  },
  analyzeBtn: {
    borderRadius: 14,
    minHeight: 46,
    overflow: "hidden"
  },
  analyzeGradient: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13
  },
  analyzeBtnIcon: {
    width: 17,
    height: 17,
    resizeMode: "contain"
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
