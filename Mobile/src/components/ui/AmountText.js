import React from 'react';
import { Text } from 'react-native';
import { useAppColors } from '../../constants/colors';
import { formatMoney } from '../../utils/format';

export default function AmountText({ value, type = 'none', showSign = false, style, ...props }) {
  const colors = useAppColors();
  const numericValue = Number(value || 0);

  let textColor = colors.TEXT;
  let prefix = '';

  if (type === 'income') {
    textColor = colors.INCOME_COLOR;
    if (showSign && numericValue > 0) prefix = '+';
  } else if (type === 'expense') {
    textColor = colors.EXPENSE_COLOR;
    if (showSign && numericValue > 0) prefix = '-';
  }

  // Format absolute value if we are adding a sign manually, otherwise format the raw value
  const absValue = showSign ? Math.abs(numericValue) : numericValue;
  const formatted = formatMoney(absValue);

  return (
    <Text style={[{ color: textColor }, style]} {...props}>
      {prefix}
      {formatted}
    </Text>
  );
}
