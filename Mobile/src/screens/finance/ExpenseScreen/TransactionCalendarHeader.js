import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import AmountText from "../../../components/ui/AmountText";
import AppIcon from "../../../components/ui/AppIcon";
import styles from "./styles";

export default function TransactionCalendarHeader({
  activeType,
  colors,
  currentMonth,
  daysInMonth,
  monthlySummary,
  nextMonth,
  prevMonth,
  renderCalendarDay,
  setActiveType,
  setSelectedDay
}) {
  const monthYearStr = `Tháng ${currentMonth.getMonth() + 1}, ${currentMonth.getFullYear()}`;
  const isDark = colors.BG === "#0F0D0C";

  return (
    <View style={styles.listHeader}>
      <View style={[styles.segmentContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }]}>
        <Pressable
          style={[
            styles.segmentButton,
            activeType === "expense" && [styles.segmentButtonActive, { backgroundColor: colors.ACTION_EXPENSE || "#F97316" }]
          ]}
          onPress={() => {
            setActiveType("expense");
            setSelectedDay(null);
          }}
        >
          <Text style={[styles.segmentButtonText, activeType === "expense" ? styles.segmentButtonTextActive : { color: colors.TEXT_SECONDARY }]}>
            Chi tiêu
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.segmentButton,
            activeType === "income" && [styles.segmentButtonActive, { backgroundColor: colors.ACTION_INCOME || "#22C55E" }]
          ]}
          onPress={() => {
            setActiveType("income");
            setSelectedDay(null);
          }}
        >
          <Text style={[styles.segmentButtonText, activeType === "income" ? styles.segmentButtonTextActive : { color: colors.TEXT_SECONDARY }]}>
            Thu nhập
          </Text>
        </Pressable>
      </View>

      <View style={[styles.monthSelector, { borderColor: colors.BORDER, backgroundColor: colors.CARD }]}>
        <Pressable onPress={prevMonth} style={styles.monthNavBtn}>
          <AppIcon name="chevron-back" size={20} color={colors.TEXT} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: colors.TEXT }]}>{monthYearStr}</Text>
        <Pressable onPress={nextMonth} style={styles.monthNavBtn}>
          <AppIcon name="chevron-forward" size={20} color={colors.TEXT} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((weekday) => (
          <Text key={weekday} style={[styles.weekdayText, { color: colors.TEXT_MUTED || "#B8A6AC" }]}>{weekday}</Text>
        ))}
      </View>

      <FlatList
        data={daysInMonth}
        renderItem={renderCalendarDay}
        keyExtractor={(item) => item.id}
        numColumns={7}
        scrollEnabled={false}
        style={styles.calendarGrid}
      />

      <View style={[styles.summaryCard, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
        {activeType === "income" ? (
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: colors.TEXT_SECONDARY }]}>Thu nhập</Text>
            <AmountText value={monthlySummary.income} type="income" style={styles.summaryValue} />
          </View>
        ) : (
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: colors.TEXT_SECONDARY }]}>Chi phí</Text>
            <AmountText value={monthlySummary.expense} type="expense" style={styles.summaryValue} />
          </View>
        )}
        <View style={[styles.summaryDivider, { backgroundColor: colors.SEPARATOR }]} />
        <View style={styles.summaryCol}>
          <Text style={[styles.summaryLabel, { color: colors.TEXT_SECONDARY }]}>Số dư ròng</Text>
          <AmountText value={monthlySummary.net} type={monthlySummary.net >= 0 ? "income" : "expense"} style={styles.summaryValue} />
        </View>
      </View>
    </View>
  );
}
