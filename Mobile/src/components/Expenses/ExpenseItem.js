import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import { formatDate } from "../../utils/format";
import AppIcon from "../ui/AppIcon";
import TransactionIcon from "../ui/TransactionIcon";
import AmountText from "../ui/AmountText";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightText({ colors, text, keyword }) {
  if (!keyword || !text) {
    return <Text style={[styles.itemName, { color: colors.TEXT }]}>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${escapeRegex(keyword)})`, "gi"));
  return (
    <Text style={[styles.itemName, { color: colors.TEXT }]}>
      {parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <Text key={`${part}-${index}`} style={[styles.highlight, { color: colors.TEXT }]}>
            {part}
          </Text>
        ) : (
          <Text key={`${part}-${index}`}>{part}</Text>
        )
      )}
    </Text>
  );
}

export default function ExpenseItem({ item, onDelete, searchKeyword }) {
  const colors = useAppColors();
  const amount = Number(item?.amount || 0);
  const note = item?.note || "";

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
      <View style={styles.itemMain}>
        <TransactionIcon iconValue={item?.icon} containerSize={36} size={18} style={{ marginRight: 10 }} />

        <View style={styles.itemContent}>
          <HighlightText colors={colors} text={item?.name || "Chi tiêu"} keyword={searchKeyword} />
          <Text style={[styles.itemMeta, { color: colors.TEXT_SECONDARY }]}>{formatDate(item?.date)} • {item?.categoryName || "Khác"}</Text>
          {note ? (
            <View style={styles.noteRow}>
              <AppIcon name="document-text-outline" size={12} color={colors.TEXT_SECONDARY} style={{ marginTop: 2 }} />
              <Text style={[styles.noteText, { color: colors.TEXT_SECONDARY }]} numberOfLines={2}>
                {note}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.itemRight}>
        <AmountText value={amount} type="expense" showSign={true} style={styles.itemAmount} />
        <Pressable
          onPress={() => onDelete(item?.id)}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel="Xóa chi tiêu"
        >
          <AppIcon name="trash-outline" size={15} color={colors.EXPENSE_COLOR || "#EF4444"} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  itemMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontWeight: "700",
    fontSize: 15,
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 12,
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemAmount: {
    fontWeight: "800",
  },
  deleteButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    gap: 4,
  },
  noteText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  highlight: {
    backgroundColor: "#fff3b0",
    fontWeight: "700",
  },
});
