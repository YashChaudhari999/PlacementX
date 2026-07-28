import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: '#16A34A' },
  warning: { bg: '#FEF3C7', text: '#D97706' },
  danger:  { bg: '#FEE2E2', text: '#DC2626' },
  info:    { bg: '#DBEAFE', text: '#2563EB' },
  neutral: { bg: '#F1F5F9', text: '#475569' },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = variantStyles[variant] ?? variantStyles.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
