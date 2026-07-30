import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { theme } from '../../theme/theme';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{icon}</View>
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {trend && (
        <View style={styles.footer}>
          {trend.isPositive ? (
            <TrendingUp size={14} color={theme.colors.success} />
          ) : (
            <TrendingDown size={14} color={theme.colors.destructive} />
          )}
          <Text
            style={[
              styles.trendText,
              { color: trend.isPositive ? theme.colors.success : theme.colors.destructive },
            ]}
          >
            {trend.value}% from last month
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing[4],
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[2],
  },
  iconContainer: {
    padding: theme.spacing[2],
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.md,
  },
  content: {
    marginBottom: theme.spacing[2],
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.foreground,
    marginBottom: theme.spacing[1],
  },
  title: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  trendText: {
    fontSize: 12,
    marginLeft: theme.spacing[1],
    fontWeight: '500',
  },
});
