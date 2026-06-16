import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import { formatMoney } from "../../utils/format";
import ShowMoreButton from "../../components/common/ShowMoreButton";
import { getSafeAreaBottom, getSafeAreaTop } from "../../utils/safeArea";
import useGoals from "../../hooks/useGoals";
import GoalForm from "../../components/Goal/GoalForm";
import CompactGoalTab from "../../components/Goal/CompactGoalTab";
import GoalDetailModal from "../../components/Goal/GoalDetailModal";
import ContributionModal from "../../components/Goal/ContributionModal";
import AppIcon from "../../components/ui/AppIcon";
import EmptyState from "../../components/ui/EmptyState";
import ScreenBackHeader from "../../components/common/ScreenBackHeader";
import { scale } from "../../utils/layoutScale";

export default function GoalScreen() {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { t } = useTranslation();

  const {
    goals,
    refreshing,
    visibleGoals,
    canExpandGoals,
    showAllGoals,
    toggleGoals,
    onRefresh,
    overview,
    name,
    targetAmount,
    startDate,
    targetDate,
    loading,
    setName,
    setTargetAmount,
    setStartDate,
    setTargetDate,
    onCreate,
    detailGoal,
    setDetailGoal,
    onDelete,
    selectedGoal,
    contributionAmount,
    contributionDate,
    contributionNote,
    setContributionAmount,
    setContributionDate,
    setContributionNote,
    openContributionModal,
    closeContributionModal,
    onContribute,
  } = useGoals();

  return (
    <View style={[styles.container, { backgroundColor: colors.BG, paddingTop: getSafeAreaTop(insets) }]}>
      <ScreenBackHeader title={t("finance.goal.title")} />
      <FlatList
        data={visibleGoals}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <CompactGoalTab item={item} onPress={setDetailGoal} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: getSafeAreaBottom(insets) + 80 },
          (!goals || !goals.length) && styles.listContentEmpty,
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={colors.PRIMARY_GRADIENT || ["#ef5e83", "#f190ab"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.overviewCard, { shadowColor: colors.PRIMARY || "#ef5e83" }]}
            >
              <View style={styles.overviewBadgeRow}>
                <View style={styles.overviewBadge}>
                  <AppIcon name="flag" size={13} color="#FFF" />
                  <Text style={styles.overviewTag}>{t("finance.goal.planTag")}</Text>
                </View>
                <View style={styles.overviewCountBadge}>
                  <Text style={styles.overviewCountText}>{t("finance.goal.count", { count: overview.activeCount })}</Text>
                </View>
              </View>

              <Text style={styles.overviewTitle}>{t("finance.goal.overviewTitle")}</Text>

              <View style={styles.overviewMoneyRow}>
                <View style={styles.overviewMoneyCol}>
                  <View style={styles.moneyLabelRow}>
                    <AppIcon name="wallet-outline" size={13} color="rgba(255,255,255,0.75)" style={styles.overviewMoneyLabelIcon} />
                    <Text style={styles.overviewMoneyLabel}>{t("finance.goal.saved")}</Text>
                  </View>
                  <Text style={styles.overviewMoneyValue}>
                    {overview.totalCurrent > 0 ? formatMoney(overview.totalCurrent) : "0 ₫"}
                  </Text>
                </View>
                <View style={styles.overviewDivider} />
                <View style={styles.overviewMoneyCol}>
                  <View style={styles.moneyLabelRow}>
                    <AppIcon name="flag-outline" size={13} color="rgba(255,255,255,0.75)" style={styles.overviewMoneyLabelIcon} />
                    <Text style={styles.overviewMoneyLabel}>{t("finance.goal.target")}</Text>
                  </View>
                  <Text style={styles.overviewMoneyValueSub}>
                    {overview.totalTarget > 0 ? formatMoney(overview.totalTarget) : "0 ₫"}
                  </Text>
                </View>
              </View>

              <View style={styles.overviewProgressRow}>
                <Text style={styles.overviewProgressPercent}>{overview.overallProgress.toFixed(0)}%</Text>
                <Text style={styles.overviewProgressLabel}>{t("finance.goal.completed")}</Text>
              </View>
              <View style={styles.overviewTrack}>
                <View style={[styles.overviewFill, { width: `${Math.max(2, overview.overallProgress)}%`, backgroundColor: colors.WHITE }]} />
              </View>
            </LinearGradient>

            <GoalForm
              name={name}
              targetAmount={targetAmount}
              startDate={startDate}
              targetDate={targetDate}
              loading={loading}
              onNameChange={setName}
              onAmountChange={setTargetAmount}
              onStartDateChange={setStartDate}
              onTargetDateChange={setTargetDate}
              onSubmit={onCreate}
            />

            {goals && goals.length ? (
              <View style={styles.listHeader}>
                <Text style={[styles.listTitle, { color: colors.TEXT }]}>{t("finance.goal.listTitle")}</Text>
                <ShowMoreButton visible={canExpandGoals} expanded={showAllGoals} onPress={toggleGoals} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={t("finance.goal.emptyTitle")}
            description={t("finance.goal.emptyDescription")}
            icon="flag-outline"
          />
        }
      />

      <GoalDetailModal
        goal={detailGoal}
        visible={Boolean(detailGoal)}
        onClose={() => setDetailGoal(null)}
        onContribute={openContributionModal}
        onDelete={onDelete}
      />

      <ContributionModal
        visible={Boolean(selectedGoal)}
        goal={selectedGoal}
        amount={contributionAmount}
        date={contributionDate}
        note={contributionNote}
        onAmountChange={setContributionAmount}
        onDateChange={setContributionDate}
        onNoteChange={setContributionNote}
        onClose={closeContributionModal}
        onSubmit={onContribute}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scale(14),
    paddingTop: scale(14),
  },

  // Overview
  overviewCard: {
    borderRadius: scale(20),
    padding: scale(18),
    marginBottom: scale(14),
    shadowOpacity: 0.25,
    shadowRadius: scale(14),
    shadowOffset: {
      width: 0,
      height: scale(6),
    },
    elevation: 6,
  },
  overviewBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(10),
  },
  overviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: scale(5),
    gap: scale(5),
  },
  overviewTag: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  overviewCountBadge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: scale(5),
  },
  overviewCountText: {
    color: "#FFF5F7",
    fontWeight: "800",
    fontSize: 12,
  },
  overviewTitle: {
    color: "#FFF",
    fontSize: scale(20),
    fontWeight: "800",
    marginBottom: scale(14),
  },
  overviewMoneyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: scale(14),
    padding: scale(14),
    marginBottom: scale(14),
  },
  overviewMoneyCol: {
    flex: 1,
  },
  moneyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(4),
  },
  overviewMoneyLabelIcon: {
    marginRight: scale(4),
  },
  overviewMoneyLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "600",
  },
  overviewMoneyValue: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },
  overviewMoneyValueSub: {
    color: "#FFF5F7",
    fontSize: 15,
    fontWeight: "700",
  },
  overviewDivider: {
    width: 1,
    height: scale(36),
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: scale(12),
  },
  overviewProgressRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: scale(8),
    gap: scale(4),
  },
  overviewProgressPercent: {
    color: "#FFF",
    fontSize: scale(26),
    fontWeight: "800",
  },
  overviewProgressLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
  },
  overviewTrack: {
    height: scale(8),
    borderRadius: scale(8),
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  overviewFill: {
    height: "100%",
    borderRadius: scale(8),
  },

  // List
  listContent: {
    paddingBottom: scale(100),
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  listHeader: {
    marginBottom: scale(8),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listTitle: {
    fontWeight: "800",
    fontSize: 16,
  },
});
