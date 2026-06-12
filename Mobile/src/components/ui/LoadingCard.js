import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAppColors } from '../../constants/colors';
import { scale } from '../../utils/layoutScale';

/**
 * Loading skeleton card with soft pulsing animation.
 */
export default function LoadingCard({ style }) {
  const COLORS = useAppColors();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.8,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.4,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.card, { backgroundColor: COLORS.SURFACE, borderColor: COLORS.CARD_BORDER }, style]}>
      <Animated.View style={[styles.shimmerLine, { backgroundColor: COLORS.CARD_BORDER, opacity: pulseAnim, width: '40%' }]} />
      <Animated.View style={[styles.shimmerLine, { backgroundColor: COLORS.CARD_BORDER, opacity: pulseAnim, width: '90%', height: scale(10) }]} />
      <Animated.View style={[styles.shimmerLine, { backgroundColor: COLORS.CARD_BORDER, opacity: pulseAnim, width: '70%', height: scale(10) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: scale(16),
    borderWidth: 1,
    marginBottom: 12,
  },
  shimmerLine: {
    height: scale(14),
    borderRadius: scale(4),
    marginBottom: scale(8),
  },
});
