import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppColors } from '../../constants/colors';

export default function WalletGradientCard({ gradientColors, style, children, ...props }) {
  const colors = useAppColors();
  const defaultColors = [
    colors.WALLET_GRADIENT_START || '#7C4DFF',
    colors.WALLET_GRADIENT_END || '#4FACFE',
  ];

  return (
    <LinearGradient
      colors={gradientColors || defaultColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
