import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../../theme/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export const Skeleton = ({ width = '100%', height = 20, borderRadius = theme.radius.sm, style }: SkeletonProps) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity: pulseAnim },
        style,
      ]}
    />
  );
};

export const DashboardSkeleton = () => (
  <View style={styles.container}>
    <Skeleton height={40} width="60%" style={styles.mb6} />
    <View style={styles.row}>
      <Skeleton height={100} width="48%" borderRadius={theme.radius.xl} />
      <Skeleton height={100} width="48%" borderRadius={theme.radius.xl} />
    </View>
    <Skeleton height={30} width="40%" style={styles.mt8} />
    <Skeleton height={150} borderRadius={theme.radius.xl} style={styles.mt4} />
    <Skeleton height={150} borderRadius={theme.radius.xl} style={styles.mt4} />
  </View>
);

export const ListSkeleton = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.listItem}>
        <Skeleton width={50} height={50} borderRadius={theme.radius.md} />
        <View style={styles.listContent}>
          <Skeleton height={20} width="70%" style={styles.mb2} />
          <Skeleton height={16} width="40%" />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.muted,
  },
  container: {
    padding: theme.spacing[4],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mb2: { marginBottom: theme.spacing[2] },
  mb6: { marginBottom: theme.spacing[6] },
  mt4: { marginTop: theme.spacing[4] },
  mt8: { marginTop: theme.spacing[8] },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listContent: {
    flex: 1,
    marginLeft: theme.spacing[4],
  },
});
