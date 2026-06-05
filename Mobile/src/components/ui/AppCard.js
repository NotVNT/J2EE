import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAppColors } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { scale } from '../../utils/layoutScale';

/**
 * Standard card container supporting shadows, borders, elevated backgrounds,
 * and touch interaction.
 */
export default function AppCard({
  children,
  style,
  elevated = false,
  bordered = true,
  shadow = true,
  onPress,
  ...props
}) {
  const COLORS = useAppColors();
  const CardComponent = onPress ? TouchableOpacity : View;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: elevated ? COLORS.SURFACE_ELEVATED : COLORS.SURFACE,
      borderColor: COLORS.CARD_BORDER,
      borderWidth: bordered ? 1 : 0,
    },
    shadow && {
      shadowColor: COLORS.SHADOW_COLOR || COLORS.BLACK,
      shadowOffset: { width: 0, height: scale(4) },
      shadowOpacity: Platform.OS === 'ios' ? 0.08 : 1,
      shadowRadius: scale(12),
      elevation: scale(4),
    },
    style,
  ];

  return (
    <CardComponent onPress={onPress} activeOpacity={0.9} style={cardStyle} {...props}>
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md,
    padding: scale(16),
  },
});
