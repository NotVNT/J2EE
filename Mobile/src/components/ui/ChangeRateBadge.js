import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '../../constants/colors';
import AppIcon from './AppIcon';

export default function ChangeRateBadge({ value, label, labelColor, style }) {
  const colors = useAppColors();

  // Determine if it is positive or negative
  let isPositive = true;
  let displayValue = '';

  if (typeof value === 'number') {
    isPositive = value >= 0;
    displayValue = `${isPositive ? '+' : ''}${value.toFixed(1)}%`;
  } else {
    const strVal = String(value || '');
    isPositive = !strVal.startsWith('-');
    displayValue = strVal;
    if (isPositive && !strVal.startsWith('+') && strVal !== '') {
      displayValue = '+' + strVal;
    }
  }

  const badgeBg = isPositive ? colors.BADGE_POSITIVE_BG : colors.BADGE_NEGATIVE_BG;
  const badgeFg = isPositive ? colors.BADGE_POSITIVE_FG : colors.BADGE_NEGATIVE_FG;
  const arrowIcon = isPositive ? 'arrow-up' : 'arrow-down';

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <AppIcon name={arrowIcon} size={12} color={badgeFg} style={styles.icon} />
        <Text style={[styles.valueText, { color: badgeFg }]}>{displayValue}</Text>
      </View>
      {label && <Text style={[styles.labelText, { color: labelColor || colors.TEXT_MUTED || '#8B7B80' }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  icon: {
    marginRight: 2,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelText: {
    fontSize: 12,
    marginLeft: 6,
  },
});
