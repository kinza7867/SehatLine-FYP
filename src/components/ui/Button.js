import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, gradients, radius, spacing, typography, shadow } from '../../theme';

/**
 * <Button label="Login" onPress={...} />
 * <Button label="Continue as Guest" variant="outline" onPress={...} />
 * <Button label="Cancel Token" variant="danger" icon="close-circle-outline" onPress={...} />
 *
 * variant: 'primary' | 'outline' | 'ghost' | 'danger' | 'success'
 * size:    'md' | 'sm'
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;
  const sizeStyle = size === 'sm' ? styles.sizeSm : styles.sizeMd;

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 18}
              color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.label,
              size === 'sm' && styles.labelSm,
              variant === 'outline' && styles.labelOutline,
              variant === 'ghost' && styles.labelGhost,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 18}
              color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );

  if (variant === 'primary' || variant === 'success' || variant === 'danger') {
    const grad =
      variant === 'success' ? gradients.success : variant === 'danger' ? gradients.danger : gradients.primary;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={isDisabled}
        style={[fullWidth && styles.fullWidth, isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, sizeStyle, shadow.button]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyle,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  base: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeMd: { paddingVertical: 15, paddingHorizontal: spacing.lg },
  sizeSm: { paddingVertical: 10, paddingHorizontal: spacing.md },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: { opacity: 0.55 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  label: { ...typography.button, color: colors.white },
  labelSm: { fontSize: 13 },
  labelOutline: { color: colors.primary },
  labelGhost: { color: colors.primary },
});