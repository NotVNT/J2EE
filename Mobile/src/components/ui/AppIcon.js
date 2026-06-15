import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

/**
 * Shared AppIcon component wrapping expo-vector-icons Ionicons.
 */
export default function AppIcon({ name, size = 24, color, style }) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
