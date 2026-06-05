import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppColors } from "../../constants/colors";
import { formatDate } from "../../utils/format";
import AppIcon from "../ui/AppIcon";
import TransactionIcon from "../ui/TransactionIcon";
import AmountText from "../ui/AmountText";
import { scale } from "../../utils/layoutScale";

export default function IncomeItem({ item, onDelete }) {
  const colors = useAppColors();
  const amount = Number(item?.amount || 0);

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
        <TransactionIcon iconValue={item?.icon || "wallet-outline"} containerSize={36} size={18} style={{ marginRight: 10 }} />

        <View style={styles.itemContent}>
          <Text style={[styles.itemName, { color: colors.TEXT }]}>{item?.name || "Thu nhập"}</Text>
          <Text style={[styles.itemMeta, { color: colors.TEXT_SECONDARY }]}>
            {formatDate(item?.date)} • {item?.categoryName || "Khác"}
          </Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <AmountText value={amount} type="income" showSign={true} style={styles.itemAmount} />
        <Pressable
          onPress={() => onDelete(item?.id)}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel="Xóa thu nhập"
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
});
