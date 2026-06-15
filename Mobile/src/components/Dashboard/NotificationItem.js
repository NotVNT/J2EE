import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, useAppColors } from "../../constants/colors";
import AppIcon from "../ui/AppIcon";
import { clampScale, scale } from "../../utils/layoutScale";

function formatRelativeTime(value) {
  if (!value) return "";

  const date = new Date(value);
  const time = date.getTime();
  if (!Number.isFinite(time)) return "";

  const diffMs = Date.now() - time;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";

  return `${diffDays} ngày trước`;
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
  const colors = useAppColors();
  const meta = getTypeMeta(item?.type, colors);
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
        accessibilityLabel={selected ? "Bỏ chọn thông báo" : "Chọn thông báo"}
      >
        {selected ? <AppIcon name="checkmark" size={12} color={COLORS.WHITE} /> : null}
      </Pressable>

      <View style={[styles.itemIcon, { backgroundColor: meta.bg }]}>
        <Text style={[styles.itemIconText, { color: meta.color }]}>{meta.icon}</Text>
      </View>

      <View style={styles.itemBody}>
        <View style={styles.itemTitleRow}>
          <Text style={[styles.itemTitle, { color: colors.TEXT }, unread && styles.itemTitleUnread]} numberOfLines={2}>
            {item?.title || "Thông báo"}
          </Text>
          {unread ? <View style={[styles.unreadDot, { backgroundColor: colors.PRIMARY }]} /> : null}
        </View>
        <Text style={[styles.itemMessage, { color: colors.TEXT_SECONDARY }]} numberOfLines={3}>
          {item?.message || ""}
        </Text>
        <Text style={[styles.itemTime, { color: colors.TEXT_MUTED }]}>{formatRelativeTime(item?.createdAt)}</Text>
      </View>

      <Pressable
        style={[styles.deleteItemButton, { backgroundColor: colors.EXPENSE_LIGHT }]}
        onPress={(event) => {
          event?.stopPropagation?.();
          onDelete(item);
        }}
        accessibilityRole="button"
        accessibilityLabel="Xóa thông báo"
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
    width: scale(32),
    aspectRatio: 1,
    borderRadius: scale(12),
    alignItems: "center",
    justifyContent: "center",
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
