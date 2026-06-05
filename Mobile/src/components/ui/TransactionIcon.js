import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryVectorIcon, getIconColor } from '../../utils/categoryIcons';

const hexToRgba = (hex, alpha) => {
  if (!hex) return 'rgba(0, 0, 0, 0.1)';
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function TransactionIcon({ iconValue, size = 20, containerSize = 40, color, style }) {
  const iconColor = color || getIconColor(iconValue);
  const bgColor = hexToRgba(iconColor, 0.15);

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize, backgroundColor: bgColor }, style]}>
      <CategoryVectorIcon iconValue={iconValue} size={size} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
