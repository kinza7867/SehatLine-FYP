import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';

/**
 * <Badge text="3" /> <Badge text="New" tone="success" />
 * tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
 */
export default function Badge({ text, tone = 'primary', style, textStyle }) {
  const toneStyle = TONES[tone] || TONES.primary;
  return (
    <View style={[styles.base, { backgroundColor: toneStyle.bg }, style]}>
      <Text style={[styles.text, { color: toneStyle.fg }, textStyle]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const TONES = {
  primary: { bg: 'rgba(11, 170, 157, 0.12)', fg: colors.primaryDark },
  success: { bg: colors.successSoft, fg: '#0F7A4E' },
  warning: { bg: colors.warningSoft, fg: '#B45309' },
  danger: { bg: colors.dangerSoft, fg: '#B91C1C' },
  neutral: { bg: colors.surfaceAlt, fg: colors.slateSoft },
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11.5, fontWeight: '700' },
});