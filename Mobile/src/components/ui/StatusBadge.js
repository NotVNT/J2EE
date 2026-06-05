import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '../../constants/colors';
import { RADIUS } from '../../constants/spacing';
import { FONTS, TEXT_SIZE } from '../../constants/typography';
import { scale } from '../../utils/layoutScale';

/**
 * Premium StatusBadge component for FREE, BASIC, and PREMIUM user states.
 */
export default function StatusBadge({ plan = 'FREE', style }) {
  const COLORS = useAppColors();

  const getPlanStyles = () => {
    switch (plan?.toUpperCase()) {
      case 'PREMIUM':
        return {
          container: {
            backgroundColor: 'rgba(255, 184, 77, 0.15)',
            borderColor: COLORS.GOLD,
          },
          text: {
            color: COLORS.GOLD,
          },
          label: 'PREMIUM',
        };
      case 'BASIC':
        return {
          container: {
            backgroundColor: 'rgba(107, 157, 210, 0.15)',
            borderColor: COLORS.INFO,
          },
          text: {
            color: COLORS.INFO,
          },
          label: 'BASIC',
        };
      case 'FREE':
      default:
        return {
          container: {
            backgroundColor: 'rgba(184, 166, 172, 0.15)',
            borderColor: COLORS.TEXT_MUTED,
          },
          text: {
            color: COLORS.TEXT_SECONDARY,
          },
          label: 'FREE',
        };
    }
  };

  const planStyle = getPlanStyles();

  return (
    <View style={[styles.container, planStyle.container, style]}>
      <Text style={[styles.text, planStyle.text]}>{planStyle.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: TEXT_SIZE.xs,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
});
