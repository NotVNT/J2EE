import React from "react";
import { Pressable, Text, View } from "react-native";
import AmountText from "../../../components/ui/AmountText";
import AppIcon from "../../../components/ui/AppIcon";
import TransactionIcon from "../../../components/ui/TransactionIcon";
import { formatDate } from "../../../utils/format";
import styles from "./styles";

export default function TransactionGroup({ colors, group, onDelete, onEdit }) {
  return (
    <View style={[styles.dateGroupContainer, { backgroundColor: colors.CARD, borderColor: colors.BORDER }]}>
      <View style={[styles.groupHeaderRow, { borderBottomColor: colors.SEPARATOR }]}>
        <Text style={[styles.groupDateText, { color: colors.TEXT }]}>{formatDate(group.date)}</Text>
        <View style={styles.groupTotalRow}>
          {group.totalIncome > 0 ? <AmountText value={group.totalIncome} type="income" showSign style={styles.groupTotalText} /> : null}
          {group.totalExpense > 0 ? <AmountText value={group.totalExpense} type="expense" showSign style={styles.groupTotalText} /> : null}
        </View>
      </View>

      {group.items.map((transaction) => (
        <Pressable
          key={`${transaction.type}-${transaction.id}`}
          onPress={() => onEdit(transaction)}
          onLongPress={() => onDelete(transaction)}
          style={styles.rowWrapper}
        >
          <View style={styles.rowLeft}>
            <TransactionIcon iconValue={transaction.icon} containerSize={36} size={18} />
            <View style={styles.rowTexts}>
              <Text style={[styles.rowName, { color: colors.TEXT }]} numberOfLines={1}>{transaction.name}</Text>
              {transaction.note ? (
                <Text style={[styles.rowNote, { color: colors.TEXT_MUTED }]} numberOfLines={1}>{transaction.note}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.rowRight}>
            <AmountText value={transaction.amount} type={transaction.type} showSign style={styles.rowAmount} />
            <View style={styles.rowActions}>
              <Pressable
                onPress={(event) => {
                  event?.stopPropagation?.();
                  onEdit(transaction);
                }}
                style={styles.rowActionButton}
                accessibilityRole="button"
                accessibilityLabel="Chỉnh sửa giao dịch"
              >
                <AppIcon name="create-outline" size={15} color={colors.PRIMARY || "#7C4DFF"} />
              </Pressable>
              <Pressable
                onPress={(event) => {
                  event?.stopPropagation?.();
                  onDelete(transaction);
                }}
                style={styles.rowActionButton}
                accessibilityRole="button"
                accessibilityLabel="Xóa giao dịch"
              >
                <AppIcon name="trash-outline" size={15} color={colors.EXPENSE_COLOR || "#EF4444"} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
