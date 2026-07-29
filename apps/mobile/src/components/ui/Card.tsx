import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...props }: CardProps) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

export const CardHeader = ({ children, style, ...props }: CardProps) => (
  <View style={[styles.header, style]} {...props}>
    {children}
  </View>
);

export const CardContent = ({ children, style, ...props }: CardProps) => (
  <View style={[styles.content, style]} {...props}>
    {children}
  </View>
);

export const CardFooter = ({ children, style, ...props }: CardProps) => (
  <View style={[styles.footer, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
    overflow: 'hidden',
  },
  header: {
    padding: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    padding: theme.spacing[6],
  },
  footer: {
    padding: theme.spacing[6],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background, // Slight contrast for footer
  },
});
