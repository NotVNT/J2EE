import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import { formatDate } from "../../utils/format";
import AppIcon from "../ui/AppIcon";
import TransactionIcon from "../ui/TransactionIcon";
import AmountText from "../ui/AmountText";

export default function IncomeItem({ item, onDelete, onEdit }) {
  const { t } = useTranslation();
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
        <TransactionIcon iconValue={item?.icon} containerSize={36} size={18} style={{ marginRight: 10 }} />

        <View style={styles.itemContent}>
          <Text style={[styles.itemName, { color: colors.TEXT }]}>{item?.name || t("incomeItem.type")}</Text>
          <Text style={[styles.itemMeta, { color: colors.TEXT_SECONDARY }]}>
            {formatDate(item?.date)} • {item?.categoryName || t("reportComponents.other")}
          </Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <AmountText value={amount} type="income" showSign={true} style={styles.itemAmount} />
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => onEdit?.(item)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t("incomeItem.editAccessibility")}
          >
            <AppIcon name="create-outline" size={15} color={colors.PRIMARY || "#7C4DFF"} />
          </Pressable>
          <Pressable
            onPress={() => onDelete(item?.id)}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t("incomeItem.deleteAccessibility")}
          >
            <AppIcon name="trash-outline" size={15} color={colors.EXPENSE_COLOR || "#EF4444"} />
          </Pressable>
        </View>
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  iconButton: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
