import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge = ({ children, variant = 'default', style }: BadgeProps) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#D1E7DD', text: '#0F5132' }; // Emerald
      case 'warning':
        return { bg: '#FFF3CD', text: '#856404' }; // Amber
      case 'destructive':
        return { bg: '#F8D7DA', text: '#842029' }; // Red
      case 'info':
        return { bg: '#CFF4FC', text: '#055160' }; // Blue
      default:
        return { bg: theme.colors.muted, text: theme.colors.mutedForeground }; // Slate
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{children}</Text>
    </View>
  );
};

// Helper for application statuses
export const StatusBadge = ({ status }: { status: string }) => {
  let variant: BadgeVariant = 'default';
  
  if (status === 'SELECTED' || status === 'PUBLISHED' || status === 'OPEN') {
    variant = 'success';
  } else if (status === 'REJECTED' || status === 'CLOSED') {
    variant = 'destructive';
  } else if (status === 'APPLIED' || status === 'SUBMITTED') {
    variant = 'info';
  } else if (status === 'ASSESSMENT_SCHEDULED' || status === 'TECHNICAL_INTERVIEW' || status === 'HR_INTERVIEW' || status === 'UPCOMING') {
    variant = 'warning';
  }

  const label = status.replace(/_/g, ' ');

  return <Badge variant={variant}>{label}</Badge>;
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
