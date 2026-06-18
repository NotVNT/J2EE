import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from "react-i18next";
import { useAppColors } from '../../constants/colors';
import AmountText from '../ui/AmountText';
import expenseIcon from '../../assets/expense/spending.png';
import incomeIcon from '../../assets/income/financial-statement.png';

export default function DailySummaryCards({ totalIncome = 0, totalExpense = 0 }) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const expenseColor = colors.EXPENSE || colors.ACTION_EXPENSE || '#EF4444';
  const incomeColor = colors.INCOME || colors.ACTION_INCOME || '#22C55E';

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Image source={expenseIcon} style={styles.iconImage} resizeMode="contain" />
          </View>
          <Text style={[styles.label, { color: expenseColor }]}>{t("dashboardComponents.expenseType")}</Text>
        </View>
        <AmountText value={totalExpense} type="expense" style={styles.amount} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Image source={incomeIcon} style={styles.iconImage} resizeMode="contain" />
          </View>
          <Text style={[styles.label, { color: incomeColor }]}>{t("dashboardComponents.incomeType")}</Text>
        </View>
        <AmountText value={totalIncome} type="income" style={styles.amount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 6,
    paddingHorizontal: 2,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    paddingLeft: 2,
  },
});
