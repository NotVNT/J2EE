import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '../../constants/colors';
import { SPACE } from '../../constants/spacing';
import { FONTS, TEXT_SIZE } from '../../constants/typography';
import { scale } from '../../utils/layoutScale';
import AppIcon from './AppIcon';
import AppButton from './AppButton';

/**
 * Standardized ErrorState component with a retry action.
 */
export default function ErrorState({
  error = 'Đã xảy ra lỗi không mong muốn.',
  onRetry,
  style,
}) {
  const COLORS = useAppColors();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: COLORS.EXPENSE_LIGHT }]}>
        <AppIcon name="alert-circle-outline" size={scale(36)} color={COLORS.EXPENSE} />
      </View>
      <Text style={[styles.title, { color: COLORS.TEXT, fontFamily: FONTS.bold }]}>
        Lỗi kết nối
      </Text>
      <Text style={[styles.description, { color: COLORS.TEXT_SECONDARY, fontFamily: FONTS.regular }]}>
        {error}
      </Text>
      {onRetry && (
        <AppButton
          title="Thử lại"
          onPress={onRetry}
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
