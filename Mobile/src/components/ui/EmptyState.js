import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '../../constants/colors';
import { SPACE } from '../../constants/spacing';
import { FONTS, TEXT_SIZE } from '../../constants/typography';
import { scale } from '../../utils/layoutScale';
import AppIcon from './AppIcon';
import AppButton from './AppButton';

/**
 * Standardized EmptyState component for list fallbacks and empty views.
 */
export default function EmptyState({
  title = 'Không có dữ liệu',
  description,
  icon = 'document-text-outline',
  actionTitle,
  onActionPress,
  style,
}) {
  const COLORS = useAppColors();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: COLORS.PRIMARY_GLOW || COLORS.PRIMARY_LIGHT }]}>
        <AppIcon name={icon} size={scale(36)} color={COLORS.PRIMARY} />
      </View>
      <Text style={[styles.title, { color: COLORS.TEXT, fontFamily: FONTS.bold }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: COLORS.TEXT_SECONDARY, fontFamily: FONTS.regular }]}>
          {description}
        </Text>
      )}
      {actionTitle && onActionPress && (
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          variant="outline"
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.md,
  },
  title: {
    fontSize: TEXT_SIZE.base,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACE.xs,
  },
  description: {
    fontSize: TEXT_SIZE.sm,
    textAlign: 'center',
    marginBottom: SPACE.md,
  },
  button: {
    marginTop: SPACE.xs,
  },
});
