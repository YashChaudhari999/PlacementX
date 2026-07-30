import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    marginVertical: theme.spacing[4],
  },
  iconContainer: {
    marginBottom: theme.spacing[4],
    opacity: 0.5, // Similar to web's opacity-50
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    maxWidth: '80%',
  },
  actionContainer: {
    marginTop: theme.spacing[2],
  },
});
