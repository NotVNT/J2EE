import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useAppColors } from '../../constants/colors';
import { RADIUS, SPACE } from '../../constants/spacing';
import { FONTS, TEXT_SIZE } from '../../constants/typography';
import { scale } from '../../utils/layoutScale';
import AppIcon from './AppIcon';

/**
 * Custom AppButton component that supports primary, secondary, outline, and ghost variants.
 */
export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) {
  const COLORS = useAppColors();

  const getStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: COLORS.PRIMARY_GLOW || COLORS.PRIMARY_LIGHT },
          text: { color: COLORS.PRIMARY },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: COLORS.PRIMARY,
          },
          text: { color: COLORS.PRIMARY },
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: COLORS.PRIMARY },
        };
      case 'primary':
      default:
        return {
          button: {
            backgroundColor: COLORS.PRIMARY,
            shadowColor: COLORS.SHADOW_COLOR || COLORS.PRIMARY,
            shadowOffset: { width: 0, height: scale(4) },
            shadowOpacity: 0.25,
            shadowRadius: scale(8),
            elevation: scale(3),
          },
          text: { color: COLORS.WHITE },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          button: { paddingVertical: scale(8), paddingHorizontal: scale(12) },
          text: { fontSize: TEXT_SIZE.sm },
        };
      case 'lg':
        return {
          button: { paddingVertical: scale(14), paddingHorizontal: scale(24) },
          text: { fontSize: TEXT_SIZE.lg },
        };
      case 'md':
      default:
        return {
          button: { paddingVertical: scale(12), paddingHorizontal: scale(16) },
          text: { fontSize: TEXT_SIZE.base },
        };
    }
  };

  const baseStyles = getStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        baseStyles.button,
        sizeStyles.button,
        disabled && styles.disabledButton,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.WHITE : COLORS.PRIMARY} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <AppIcon
              name={icon}
              size={size === 'sm' ? scale(16) : scale(20)}
              color={baseStyles.text.color}
              style={styles.leftIcon}
            />
          )}
          <Text style={[styles.text, baseStyles.text, sizeStyles.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <AppIcon
              name={icon}
              size={size === 'sm' ? scale(16) : scale(20)}
              color={baseStyles.text.color}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  leftIcon: {
    marginRight: SPACE.sm,
  },
  rightIcon: {
    marginLeft: SPACE.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
