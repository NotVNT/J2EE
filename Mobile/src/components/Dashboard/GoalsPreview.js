import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import { clampScale, scale } from "../../utils/layoutScale";
import { formatMoney, formatDate } from "../../utils/format";
import { DashboardSectionCard, DashboardSectionHeader } from "./DashboardSection";
import ShowMoreButton from "../common/ShowMoreButton";
import AppIcon from "../ui/AppIcon";
import TransactionIcon from "../ui/TransactionIcon";

function GoalPreviewCard({ goal, onPress }) {
  const colors = useAppColors();
  const target = Number(goal?.targetAmount || 0);
  const current = Number(goal?.currentAmount || 0);
  const progress = Math.max(0, Math.min(100, Number(goal?.progressPercent || 0)));

  return (
    <Pressable style={[styles.goalCard, { borderBottomColor: colors.SEPARATOR }]} onPress={onPress}>
      <View style={styles.cardContent}>
        <TransactionIcon
          iconValue="mdi:flag"
          color={colors.GOAL_PROGRESS || "#F97316"}
          containerSize={40}
          style={styles.iconContainer}
        />
        
        <View style={styles.infoContainer}>
          <View style={styles.goalTitleRow}>
            <Text style={[styles.goalName, { color: colors.TEXT }]} numberOfLines={1}>
              {goal?.name || "Mục tiêu"}
            </Text>
            <Text style={[styles.goalPercent, { color: colors.GOAL_PROGRESS || "#F97316" }]}>
              {Math.round(progress)}%
            </Text>
          </View>

          {goal?.startDate || goal?.targetDate ? (
            <Text style={[styles.goalDate, { color: colors.TEXT_MUTED || "#B8A6AC" }]}>
              {formatDate(goal?.startDate)} - {formatDate(goal?.targetDate)}
            </Text>
          ) : null}

          <View style={styles.amountRow}>
            <Text style={[styles.amountText, { color: colors.TEXT_SECONDARY }]}>
              {formatMoney(current)} / {formatMoney(target)}
            </Text>
          </View>

          <View style={[styles.goalTrack, { backgroundColor: colors.APP_BACKGROUND || "#F2F2F7" }]}>
            <View
              style={[
                styles.goalFill,
                { width: `${progress}%`, backgroundColor: colors.GOAL_PROGRESS || "#F97316" }
              ]}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function GoalsPreview({ goals, onCreate, onGoalPress, onMore }) {
  const colors = useAppColors();

  return (
    <>
      <DashboardSectionHeader title="Mục tiêu tiết kiệm">
        <ShowMoreButton visible={Boolean(onMore)} onPress={onMore} label="Xem tất cả" />
      </DashboardSectionHeader>
      <DashboardSectionCard>
        {goals && goals.length > 0 ? (
          goals.map((goal) => <GoalPreviewCard key={goal.id} goal={goal} onPress={onGoalPress} />)
        ) : (
          <View style={styles.emptyGoalContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.BADGE_POSITIVE_BG || "rgba(34, 197, 94, 0.1)" }]}>
              <AppIcon name="flag-outline" size={26} color={colors.GOAL_PROGRESS || "#F97316"} />
            </View>
            <Text style={[styles.emptyGoalText, { color: colors.TEXT_SECONDARY }]}>Chưa có mục tiêu tiết kiệm nào.</Text>
            <Pressable style={[styles.createGoalButton, { backgroundColor: colors.GOAL_PROGRESS || "#F97316" }]} onPress={onCreate}>
              <Text style={styles.createGoalButtonText}>Tạo mục tiêu</Text>
            </Pressable>
          </View>
        )}
      </DashboardSectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    paddingVertical: scale(12),
    borderBottomWidth: 0.5,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  goalName: {
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },
  goalPercent: {
    fontSize: 14,
    fontWeight: "700",
  },
  goalDate: {
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 4,
  },
  amountRow: {
    marginBottom: 6,
  },
  amountText: {
    fontSize: 12,
    fontWeight: "500",
  },
  goalTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  goalFill: {
    height: "100%",
    borderRadius: 3,
  },
  emptyGoalContainer: {
    alignItems: "center",
    paddingVertical: scale(16),
  },
  emptyIconCircle: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(8),
  },
  emptyGoalText: {
    fontSize: clampScale(13, 11, 15),
    marginBottom: scale(12),
    textAlign: "center",
  },
  createGoalButton: {
    borderRadius: scale(10),
    paddingHorizontal: scale(18),
    paddingVertical: scale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createGoalButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: clampScale(13, 11, 15),
  },
});
