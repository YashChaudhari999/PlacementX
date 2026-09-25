import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { AppTheme } from '../../theme/theme';

interface CardProps extends ViewProps { children: React.ReactNode; }
const useStyles = () => {
  const { theme } = useAppTheme();
  return React.useMemo(() => createStyles(theme), [theme]);
};

export const Card = ({ children, style, ...props }: CardProps) => {
  const styles = useStyles();
  return <View style={[styles.card, style]} {...props}>{children}</View>;
};
export const CardHeader = ({ children, style, ...props }: CardProps) => {
  const styles = useStyles();
  return <View style={[styles.header, style]} {...props}>{children}</View>;
};
export const CardContent = ({ children, style, ...props }: CardProps) => {
  const styles = useStyles();
  return <View style={[styles.content, style]} {...props}>{children}</View>;
};
export const CardFooter = ({ children, style, ...props }: CardProps) => {
  const styles = useStyles();
  return <View style={[styles.footer, style]} {...props}>{children}</View>;
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.card, overflow: 'hidden' },
  header: { padding: theme.spacing[6], borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  content: { padding: theme.spacing[6] },
  footer: { padding: theme.spacing[6], borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.background },
});
