import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAppColors } from '../../constants/colors';
import AppIcon from './AppIcon';

export default function ActionButton({ icon, label, color, onPress, style }) {
  const colors = useAppColors();

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.circle, { backgroundColor: color }]}>
        <AppIcon name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={[styles.label, { color: colors.TEXT }]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 75,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 15,
    fontWeight: '500',
  },
});
