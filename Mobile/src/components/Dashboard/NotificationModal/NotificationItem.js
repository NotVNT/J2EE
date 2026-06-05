import React from "react";
import { Pressable, Text, View } from "react-native";
import { COLORS, useAppColors } from "../../../constants/colors";
import AppIcon from "../../ui/AppIcon";
import { formatRelativeTime, getTypeMeta } from "./constants";
import styles from "./styles";

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
