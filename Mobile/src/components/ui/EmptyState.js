import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '../../constants/colors';
import { scale } from '../../utils/layoutScale';
import AppIcon from './AppIcon';
import AppButton from './AppButton';

/**
 * Standardized EmptyState component for list fallbacks and empty views.
 */
export default function EmptyState({
  title,
  description,
  icon = 'document-text-outline',
  actionTitle,
  onActionPress,
  style,
}) {
  const { t } = useTranslation();
  const COLORS = useAppColors();
  const resolvedTitle = title || t("emptyState.noData");

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: COLORS.PRIMARY_GLOW || COLORS.PRIMARY_LIGHT }]}>
        <AppIcon name={icon} size={scale(36)} color={COLORS.PRIMARY} />
      </View>
      <Text style={[styles.title, { color: COLORS.TEXT }]}>
        {resolvedTitle}
      </Text>
      {description && (
        <Text style={[styles.description, { color: COLORS.TEXT_SECONDARY }]}>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    marginTop: 4,
  },
});
