import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadow } from '../../theme';

/**
 * <Card>...</Card>                 — static surface
 * <Card onPress={...}>...</Card>   — pressable surface
 * <Card padded={false} />          — no internal padding (e.g. for headers)
 * <Card elevated />                — stronger shadow for hero/featured cards
 */
export default function Card({ children, onPress, style, padded = true, elevated = false }) {
  const content = (
    <View
      style={[
        styles.base,
        elevated ? shadow.raised : shadow.card,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: spacing.md },
});