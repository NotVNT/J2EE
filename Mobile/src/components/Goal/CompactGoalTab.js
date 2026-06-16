import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";
import { formatDate } from "../../utils/format";
import { getGoalVisual } from "./goalUtils";

export default function CompactGoalTab({ item, onPress }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const progress = Math.max(0, Math.min(100, Number(item?.progressPercent || 0)));
  const visual = getGoalVisual(item, t);

  // SpendBee goals color scheme
  const progressColor = item?.status === "COMPLETED" 
    ? (colors.INCOME_COLOR || "#22C55E") 
    : (item?.isBehindSchedule 
      ? (colors.EXPENSE_COLOR || "#EF4444") 
      : (colors.GOAL_PROGRESS || "#F97316"));

  return (
    <Pressable style={[styles.tab, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]} onPress={() => onPress(item)}>
      <View style={[styles.accent, { backgroundColor: progressColor }]} />
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.TEXT }]} numberOfLines={1}>{item?.name || t("goalDetailModal.goal")}</Text>
          <Text style={[styles.percent, { color: progressColor }]}>{progress.toFixed(0)}%</Text>
        </View>
        <Text style={[styles.period, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
          {formatDate(item?.startDate)} {'>'} {formatDate(item?.targetDate)}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.CARD_BORDER }]}> 
          <View style={[styles.fill, { width: `${progress}%`, backgroundColor: progressColor }]} />
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: visual.bg }]}>
        <Text style={[styles.statusText, { color: progressColor }]}>{visual.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 74,
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 4,
    marginRight: 10,
  },
  main: {
    flex: 1,
    paddingRight: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  percent: {
    fontWeight: "900",
    fontSize: 13,
    marginLeft: 8,
  },
  name: {
    color: COLORS.TEXT,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 2,
  },
  period: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  track: {
    marginTop: 7,
    height: 5,
    borderRadius: 5,
    backgroundColor: COLORS.CARD_BORDER,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: "700",
    fontSize: 12,
  },
});
