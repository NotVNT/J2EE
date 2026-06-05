import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '../../constants/colors';
import AppIcon from '../ui/AppIcon';
import AmountText from '../ui/AmountText';

export default function DailySummaryCards({ todayIncome = 0, todayExpense = 0 }) {
  const colors = useAppColors();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <AppIcon name="arrow-down-circle-outline" size={18} color="#EF4444" />
          </View>
          <Text style={[styles.label, { color: colors.TEXT_SECONDARY }]}>Chi phí hôm nay</Text>
        </View>
        <AmountText value={todayExpense} type="expense" style={styles.amount} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.SURFACE, borderColor: colors.BORDER }]}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <AppIcon name="arrow-up-circle-outline" size={18} color="#22C55E" />
          </View>
          <Text style={[styles.label, { color: colors.TEXT_SECONDARY }]}>Thu nhập hôm nay</Text>
        </View>
        <AmountText value={todayIncome} type="income" style={styles.amount} />
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    paddingLeft: 2,
  },
});
