import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const [analyticsRes, drivesRes] = await Promise.all([
        api.get('/api/admin/analytics', { headers: { 'x-user-id': user?.id } }),
        api.get('/api/admin/drives', { headers: { 'x-user-id': user?.id } }),
      ]);
      setStats(analyticsRes.data);
      setDrives(drivesRes.data?.slice(0, 4) ?? []);
    } catch (e) { console.error(e); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };
  useEffect(() => { fetch(); }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth/role-select'); } },
    ]);
  };

  const kpis = stats ? [
    { label: 'Total Students', value: stats.summary?.totalStudents ?? 0, icon: 'people', color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Total Offers', value: stats.summary?.totalOffers ?? 0, icon: 'checkmark-circle', color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Avg Package', value: stats.summary?.avgPackage ? `₹${stats.summary.avgPackage}L` : 'N/A', icon: 'cash', color: '#0891B2', bg: '#E0F2FE' },
    { label: 'Placement %', value: stats.summary?.placementPercentage ? `${stats.summary.placementPercentage}%` : '0%', icon: 'trending-up', color: '#D97706', bg: '#FEF3C7' },
  ] : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Portal</Text>
            <Text style={styles.sub}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EA580C" />
          </TouchableOpacity>
        </View>

        {/* KPIs */}
        {kpis.length > 0 && (
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
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(admin)/drives')}>
            <Ionicons name="add-circle" size={24} color="#EA580C" />
            <Text style={styles.actionText}>New Drive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(admin)/notifications')}>
            <Ionicons name="megaphone" size={24} color="#4F46E5" />
            <Text style={styles.actionText}>Broadcast</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(admin)/students')}>
            <Ionicons name="people" size={24} color="#0891B2" />
            <Text style={styles.actionText}>Students</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(admin)/analytics')}>
            <Ionicons name="pie-chart" size={24} color="#16A34A" />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Drives */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Drives</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/drives')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {drives.map((d) => (
          <Card key={d.id} style={styles.driveCard}>
            <View style={styles.driveRow}>
              <View style={styles.driveLogo}>
                <Text style={styles.driveLogoText}>{d.company?.name?.[0] ?? '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driveName}>{d.company?.name}</Text>
                <Text style={styles.driveRole}>{d.jobRole}</Text>
              </View>
              <Badge
                label={d.status}
                variant={d.status === 'PUBLISHED' ? 'success' : d.status === 'CLOSED' ? 'danger' : 'neutral'}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  sub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  kpiCard: { width: '47%', alignItems: 'center', padding: 14, gap: 6 },
  kpiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  kpiLabel: { fontSize: 10, color: '#64748B', fontWeight: '600', textAlign: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#EA580C' },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  actionText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  driveCard: { marginBottom: 10 },
  driveRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driveLogo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  driveLogoText: { fontSize: 16, fontWeight: '800', color: '#EA580C' },
  driveName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  driveRole: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
