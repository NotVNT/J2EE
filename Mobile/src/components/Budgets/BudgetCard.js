import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import { getBudgetVisual } from "../../utils/budget";
import { formatMoney } from "../../utils/format";
import { getIconColor } from "../../utils/categoryIcons";
import AppIcon from "../ui/AppIcon";
import TransactionIcon from "../ui/TransactionIcon";
import { scale } from "../../utils/layoutScale";

export default function BudgetCard({ item, onDelete }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const limit = Number(item?.amountLimit || 0);
  const spent = Number(item?.totalSpent || 0);
  const ratio = limit > 0 ? spent / limit : 0;
  const progress = Math.min(100, ratio * 100);
  const visual = getBudgetVisual(ratio);
  const now = new Date();
  const month = Number(item?.month || now.getMonth() + 1);
  const year = Number(item?.year || now.getFullYear());
  const iconColor = getIconColor(item?.categoryIcon);

  // SpendBee custom progress color
  let progressBarColor = colors.ACTION_EXPENSE; // Orange (default)
  if (ratio >= 1) {
    progressBarColor = "#EF4444"; // Red (exceeded)
  } else if (ratio >= 0.8) {
    progressBarColor = "#F59E0B"; // Amber (warning)
  }

  return (
    <View
      style={[
        styles.itemCard,
        {
          backgroundColor: colors.CARD,
          borderColor: colors.CARD_BORDER,
          shadowColor: colors.SHADOW_COLOR || "#000",
        },
      ]}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderLeft}>
          <TransactionIcon iconValue={item?.categoryIcon} size={20} containerSize={40} color={iconColor} style={styles.itemIcon} />
          <View style={styles.itemHeaderTextWrap}>
            <Text style={[styles.itemName, { color: colors.TEXT }]}>{item?.categoryName || t("budgetCard.budget")}</Text>
            <Text style={[styles.itemSubTitle, { color: colors.TEXT_SECONDARY }]}>{t(`forecastComponents.month${month}`)} {year}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => onDelete(item?.id)}
          style={styles.iconButton}
          accessibilityRole="button"
        >
          <AppIcon name="trash-outline" size={15} color={colors.EXPENSE_COLOR || "#EF4444"} />
        </Pressable>
      </View>
      <View style={styles.statsRow}>
        <View>
          <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>{t("budgetSummary.spent")}</Text>
          <Text style={[styles.statValue, { color: colors.EXPENSE }]}>{formatMoney(spent)}</Text>
        </View>
        <View style={styles.statRight}>
          <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>{t("budgetSummary.limit")}</Text>
          <Text style={[styles.statValue, { color: colors.TEXT }]}>{formatMoney(limit)}</Text>
        </View>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.CARD_BORDER }]}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progressBarColor }]} />
      </View>
      <View style={styles.progressFooter}>
        <View style={[styles.statusBadge, { backgroundColor: visual.bg, borderColor: visual.border }]}>
          <Text style={[styles.statusBadgeText, { color: visual.color }]}>{visual.label}</Text>
        </View>
        <Text style={[styles.progressPercent, { color: progressBarColor }]}>{progress.toFixed(0)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: scale(16),
    marginBottom: scale(12),
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: scale(8),
  },
  itemIcon: {
    marginRight: scale(10),
  },
  itemHeaderTextWrap: {
    flex: 1,
  },
  itemName: {
    fontWeight: "800",
    marginBottom: scale(2),
  },
  itemSubTitle: {
    fontSize: 12,
  },
  iconButton: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statsRow: {
    marginTop: scale(10),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statRight: {
    alignItems: "flex-end",
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    marginTop: scale(2),
    fontWeight: "700",
  },
  progressTrack: {
    marginTop: scale(10),
    height: scale(8),
    borderRadius: scale(8),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressFooter: {
    marginTop: scale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: scale(9),
    paddingVertical: scale(4),
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressPercent: {
    fontWeight: "800",
  }
});
