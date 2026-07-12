import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, RefreshControl, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

const { width } = Dimensions.get('window');
const BAR_MAX_WIDTH = width - 80 - 32; // container - padding - label width

export default function AdminAnalytics() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/api/admin/analytics', { headers: { 'x-user-id': user?.id } });
      setData(res.data);
    } catch (e) { console.error(e); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };
  useEffect(() => { fetch(); }, []);

  if (!data) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}><Text style={{ color: '#94A3B8' }}>Loading analytics...</Text></View>
    </SafeAreaView>
  );

  const { summary, branchWise = [], packageDistribution = [] } = data;

  // Find max for bar chart scaling
  const maxBranch = Math.max(...branchWise.map((b: any) => b.placed ?? 0), 1);

  const kpis = [
    { label: 'Total Students', value: summary?.totalStudents ?? 0, icon: 'people', color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Placed Students', value: summary?.placedStudents ?? 0, icon: 'checkmark-circle', color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Avg Package', value: `₹${summary?.avgPackage ?? 0}L`, icon: 'cash', color: '#0891B2', bg: '#E0F2FE' },
    { label: 'Placement %', value: `${summary?.placementPercentage ?? 0}%`, icon: 'trending-up', color: '#D97706', bg: '#FEF3C7' },
    { label: 'Highest Pkg', value: `₹${summary?.highestPackage ?? 0}L`, icon: 'trophy', color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Active Drives', value: summary?.activeDrives ?? 0, icon: 'briefcase', color: '#EA580C', bg: '#FFF7ED' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.sub}>Placement insights at a glance</Text>

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          {kpis.map((k) => (
            <Card key={k.label} style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
                <Ionicons name={k.icon as any} size={18} color={k.color} />
              </View>
              <Text style={styles.kpiValue}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </Card>
          ))}
        </View>

        {/* Branch-wise bar chart */}
        {branchWise.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Placements by Branch</Text>
            {branchWise.map((b: any) => {
              const barWidth = Math.max(4, (b.placed / maxBranch) * BAR_MAX_WIDTH);
              return (
                <View key={b.branch} style={styles.barRow}>
                  <Text style={styles.barLabel}>{b.branch?.replace('B.Tech ', '') ?? 'N/A'}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: barWidth }]} />
                  </View>
                  <Text style={styles.barValue}>{b.placed}</Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Package distribution */}
        {packageDistribution.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Package Distribution</Text>
            {packageDistribution.map((p: any, i: number) => {
              const colors = ['#4F46E5', '#0891B2', '#16A34A', '#D97706', '#EA580C', '#7C3AED'];
              const c = colors[i % colors.length];
              return (
                <View key={p.range} style={styles.distRow}>
                  <View style={[styles.distDot, { backgroundColor: c }]} />
                  <Text style={styles.distLabel}>{p.range} LPA</Text>
                  <View style={styles.distBar}>
                    <View style={[styles.distFill, { flex: p.count, backgroundColor: c + '30' }]} />
                  </View>
                  <Text style={[styles.distCount, { color: c }]}>{p.count}</Text>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  sub: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: { width: '47%', alignItems: 'center', padding: 14, gap: 6 },
  kpiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  kpiLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', textAlign: 'center' },
  chartCard: { marginBottom: 16, gap: 12 },
  chartTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 52, fontSize: 11, color: '#64748B', fontWeight: '600' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 },
  barFill: { height: 8, backgroundColor: '#4F46E5', borderRadius: 4 },
  barValue: { width: 24, fontSize: 12, color: '#475569', fontWeight: '700', textAlign: 'right' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distDot: { width: 10, height: 10, borderRadius: 5 },
  distLabel: { width: 60, fontSize: 12, color: '#64748B', fontWeight: '600' },
  distBar: { flex: 1, height: 10, flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  distFill: { height: 10 },
  distCount: { width: 24, fontSize: 13, fontWeight: '700', textAlign: 'right' },
});
