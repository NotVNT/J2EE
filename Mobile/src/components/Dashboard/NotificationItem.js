import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";
import AppIcon from "../ui/AppIcon";
import { clampScale, scale } from "../../utils/layoutScale";

function formatRelativeTime(value, t) {
  if (!value) return "";

  const date = new Date(value);
  const time = date.getTime();
  if (!Number.isFinite(time)) return "";

  const diffMs = Date.now() - time;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return t("notificationItem.justNow");
  if (diffMinutes < 60) return t("notificationItem.minutesAgo", { count: diffMinutes });
  if (diffHours < 24) return t("notificationItem.hoursAgo", { count: diffHours });
  if (diffDays === 1) return t("notificationItem.yesterday");

  return t("notificationItem.daysAgo", { count: diffDays });
}

function getTypeMeta(type, colors) {
  switch (type) {
    case "EXPENSE":
    case "BUDGET_EXCEEDED":
    case "SPENDING_ALERT":
      return { icon: "!", color: colors.EXPENSE, bg: colors.EXPENSE_LIGHT };
    case "INCOME":
    case "GOAL_PROGRESS":
      return { icon: "+", color: colors.INCOME, bg: colors.INCOME_LIGHT };
    case "BUDGET_ALERT":
    case "BUDGET_WARNING":
      return { icon: "!", color: colors.WARNING, bg: colors.WARNING_LIGHT };
    case "PAYMENT":
    case "SAVING_STREAK":
      return { icon: "\u2713", color: colors.PRIMARY, bg: colors.ROSE_MIST };
    case "MONTHLY_REPORT":
    case "ADMIN":
    case "SYSTEM":
    default:
      return { icon: "i", color: colors.INFO, bg: colors.INFO_LIGHT };
  }
}

export default function NotificationItem({ item, onDelete, onPress, onToggleSelect, selected }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const unread = !item?.isRead;

  return (
    <Pressable
      style={[styles.item, { borderBottomColor: colors.BG }, unread && styles.itemUnread]}
      onPress={() => onPress(item)}
    >
      <Pressable
        style={[
          styles.selectButton,
          {
            borderColor: selected ? colors.PRIMARY : colors.CARD_BORDER,
            backgroundColor: selected ? colors.PRIMARY : colors.CARD
          }
        ]}
        onPress={(event) => {
          event?.stopPropagation?.();
          onToggleSelect(item?.id);
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={selected ? t("notificationItem.deselect") : t("notificationItem.select")}
      >
        {selected ? <AppIcon name="checkmark" size={12} color={COLORS.WHITE} /> : null}
      </Pressable>

      <View style={styles.itemBody}>
        <View style={styles.itemTitleRow}>
          <Text style={[styles.itemTitle, { color: colors.TEXT }, unread && styles.itemTitleUnread]} numberOfLines={2}>
            {item?.title || t("notificationItem.defaultTitle")}
          </Text>
          {unread ? <View style={[styles.unreadDot, { backgroundColor: colors.PRIMARY }]} /> : null}
        </View>
        <Text style={[styles.itemMessage, { color: colors.TEXT_SECONDARY }]} numberOfLines={3}>
          {item?.message || ""}
        </Text>
        <Text style={[styles.itemTime, { color: colors.TEXT_MUTED }]}>{formatRelativeTime(item?.createdAt, t)}</Text>
      </View>

      <Pressable
        style={styles.deleteItemButton}
        onPress={(event) => {
          event?.stopPropagation?.();
          onDelete(item);
        }}
        accessibilityRole="button"
        accessibilityLabel={t("notificationItem.deleteAccessibility")}
      >
        <AppIcon name="trash-outline" size={16} color={colors.EXPENSE} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: scale(11),
    borderBottomWidth: 1
  },
  itemUnread: {
    backgroundColor: "rgba(232, 89, 122, 0.06)"
  },
  itemIcon: {
    width: scale(36),
    aspectRatio: 1,
    borderRadius: scale(13),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10)
  },
  itemIconText: {
    fontSize: clampScale(18, 16, 22),
    fontWeight: "900"
  },
  itemBody: {
    flex: 1
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(8)
  },
  itemTitle: {
    flex: 1,
    fontSize: clampScale(14, 12, 16),
    fontWeight: "700",
    lineHeight: scale(19)
  },
  itemTitleUnread: {
    fontWeight: "900"
  },
  unreadDot: {
    width: scale(8),
    aspectRatio: 1,
    borderRadius: scale(4),
    marginTop: scale(5)
  },
  itemMessage: {
    marginTop: scale(5),
    fontSize: clampScale(13, 11, 15),
    lineHeight: scale(18)
  },
  itemTime: {
    marginTop: scale(7),
    fontSize: clampScale(11, 9, 13),
    fontWeight: "700"
  },
  deleteItemButton: {
    padding: scale(4),
    marginLeft: scale(10)
  },
  selectButton: {
    width: scale(22),
    aspectRatio: 1,
    borderRadius: scale(7),
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10)
  }
});
