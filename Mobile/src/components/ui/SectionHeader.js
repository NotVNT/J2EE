import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppColors } from '../../constants/colors';
import { SPACE } from '../../constants/spacing';
import { FONTS, TEXT_SIZE } from '../../constants/typography';
import { scale } from '../../utils/layoutScale';

/**
 * Standardized Section Header with premium accent decoration and action text.
 */
export default function SectionHeader({
  title,
  actionTitle,
  onActionPress,
  style,
}) {
  const COLORS = useAppColors();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <View style={[styles.decorator, { backgroundColor: COLORS.PRIMARY }]} />
        <Text style={[styles.title, { color: COLORS.TEXT, fontFamily: FONTS.bold }]}>
          {title}
        </Text>
      </View>
      {actionTitle && onActionPress && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={[styles.action, { color: COLORS.PRIMARY, fontFamily: FONTS.medium }]}>
            {actionTitle}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACE.md,
    paddingHorizontal: scale(4),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decorator: {
    width: scale(4),
    height: scale(16),
    borderRadius: scale(2),
    marginRight: SPACE.xs + 2,
  },
  title: {
    fontSize: TEXT_SIZE.lg,
    fontWeight: '700',
  },
  action: {
    fontSize: TEXT_SIZE.sm,
    fontWeight: '600',
  },
});
