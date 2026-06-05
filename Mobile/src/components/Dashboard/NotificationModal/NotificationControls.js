import React from "react";
import { Pressable, Text, View } from "react-native";
import { COLORS } from "../../../constants/colors";
import AppIcon from "../../ui/AppIcon";
import { CATEGORY_FILTER_OPTIONS, READ_FILTER_OPTIONS } from "./constants";
import styles from "./styles";

export function NotificationFilters({ categoryFilter, colors, readFilter, setCategoryFilter, setReadFilter }) {
  return (
    <View style={[styles.filterPanel, { borderBottomColor: colors.CARD_BORDER }]}>
      <View style={[styles.readFilterGroup, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
        {READ_FILTER_OPTIONS.map((option) => {
          const active = readFilter === option.id;
          return (
            <Pressable
              key={option.id}
              style={[styles.readFilterButton, active && { backgroundColor: colors.CARD, shadowColor: colors.TEXT }]}
              onPress={() => setReadFilter(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.readFilterText, { color: active ? colors.TEXT : colors.TEXT_SECONDARY }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.categoryFilters}>
        {CATEGORY_FILTER_OPTIONS.map((option) => {
          const active = categoryFilter === option.id;
          return (
            <Pressable
              key={option.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active ? colors.PRIMARY : colors.CARD,
                  borderColor: active ? colors.PRIMARY : colors.CARD_BORDER
                }
              ]}
              onPress={() => setCategoryFilter(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
            >
              <AppIcon name={option.icon} size={14} color={active ? COLORS.WHITE : colors.TEXT_SECONDARY} />
              <Text style={[styles.categoryChipText, { color: active ? COLORS.WHITE : colors.TEXT_SECONDARY }]} numberOfLines={1}>
                {option.compactLabel || option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SelectionBar({ allVisibleSelected, colors, onDeleteSelected, onToggleAll, selectedCount }) {
  return (
    <View style={[styles.selectionBar, { backgroundColor: colors.BG, borderBottomColor: colors.CARD_BORDER }]}>
      <Pressable
        style={styles.selectAllRow}
        onPress={onToggleAll}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: allVisibleSelected }}
      >
        <View style={[
          styles.selectButton,
          {
            borderColor: allVisibleSelected ? colors.PRIMARY : colors.CARD_BORDER,
            backgroundColor: allVisibleSelected ? colors.PRIMARY : colors.CARD
          }
        ]}>
          {allVisibleSelected ? <AppIcon name="checkmark" size={12} color={COLORS.WHITE} /> : null}
        </View>
        <Text style={[styles.selectAllText, { color: colors.TEXT_SECONDARY }]}>
          {selectedCount > 0 ? `Đã chọn ${selectedCount} mục` : "Chọn tất cả"}
        </Text>
      </Pressable>
      {selectedCount > 0 ? (
        <Pressable
          style={[styles.deleteSelectedButton, { backgroundColor: colors.EXPENSE_LIGHT }]}
          onPress={onDeleteSelected}
          accessibilityRole="button"
          accessibilityLabel="Xóa thông báo đã chọn"
        >
          <AppIcon name="trash-outline" size={14} color={colors.EXPENSE} />
          <Text style={[styles.deleteSelectedText, { color: colors.EXPENSE }]}>Xóa đã chọn</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
