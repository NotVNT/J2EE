import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import { clampScale, scale } from "../../utils/layoutScale";
import { formatRelativeTime } from "../../utils/dashboard";
import { DashboardSectionCard, ToggleSectionHeader } from "./DashboardSection";
import TransactionIcon from "../ui/TransactionIcon";
import AmountText from "../ui/AmountText";

function TransactionRow({ item }) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const isIncome = String(item?.type || "").toUpperCase().includes("INCOME");

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionLeft}>
        <TransactionIcon
          iconValue={item?.icon}
          containerSize={40}
          size={20}
          style={styles.iconContainer}
        />
        <View style={styles.textDetails}>
          <Text style={[styles.transactionName, { color: colors.TEXT }]} numberOfLines={1}>
            {item?.name || t("dashboardComponents.transaction")}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.TEXT_MUTED || "#B8A6AC" }]}>
            {formatRelativeTime(item?.createdAt || item?.updatedAt || item?.date)}
          </Text>
        </View>
      </View>
      <AmountText
        value={item?.amount}
        type={isIncome ? "income" : "expense"}
        showSign={true}
        style={styles.transactionAmount}
      />
    </View>
  );
}

export default function RecentTransactionsSection({ canToggle, expanded, onToggle, transactions }) {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <>
      <ToggleSectionHeader title={t("dashboardComponents.recentTransactions")} visible={canToggle} expanded={expanded} onPress={onToggle} />
      <DashboardSectionCard>
        {transactions && transactions.length ? (
          transactions.map((item) => <TransactionRow key={item.id || `${item.name}-${item.date}`} item={item} />)
        ) : (
          <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>{t("dashboardComponents.noRecentTransactions")}</Text>
        )}
      </DashboardSectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(10),
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: scale(8),
  },
  iconContainer: {
    marginRight: scale(10),
  },
  textDetails: {
    flex: 1,
  },
  transactionName: {
    fontWeight: "600",
    fontSize: 14,
  },
  transactionDate: {
    marginTop: scale(2),
    fontSize: 12,
  },
  transactionAmount: {
    fontWeight: "700",
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: scale(16),
  },
});
