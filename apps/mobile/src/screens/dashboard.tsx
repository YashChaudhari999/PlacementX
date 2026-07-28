import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Bell, Briefcase, FileText, CheckCircle, IndianRupee, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function StudentDashboard() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const [drivesRes, appsRes] = await Promise.all([
        api.get('/api/student/drives', { headers: { 'x-user-id': user?.id } }),
        api.get('/api/student/applications', { headers: { 'x-user-id': user?.id } }),
      ]);
      setDrives(drivesRes.data);
      setApplications(appsRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  useEffect(() => { fetch(); }, []);

  const placed = applications.filter((a) => a.status === 'SELECTED').length;
  const stats: StatCard[] = [
    { label: 'Active Drives', value: drives.length, icon: <Briefcase color="#4F46E5" size={20} />, color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Applications', value: applications.length, icon: <FileText color="#0891B2" size={20} />, color: '#0891B2', bg: '#E0F2FE' },
    { label: 'Offers Received', value: placed, icon: <CheckCircle color="#16A34A" size={20} />, color: '#16A34A', bg: '#DCFCE7' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              👋 Hello, {user?.firstName || user?.email?.split('@')[0]}!
            </Text>
            <Text style={styles.subGreeting}>Check your placement updates</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell color="#4F46E5" size={22} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <Card key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                {s.icon}
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* Active Drives */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Drives</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Drives')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {drives.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Briefcase color="#CBD5E1" size={40} />
              <Text style={styles.emptyText}>No active drives at the moment</Text>
            </Card>
          ) : (
            drives.slice(0, 3).map((drive) => (
              <TouchableOpacity
                key={drive.id}
                onPress={() => navigation.navigate('DriveDetails', { id: drive.id })}
                activeOpacity={0.85}
              >
                <Card style={styles.driveCard}>
                  <View style={styles.driveHeader}>
                    <View>
                      <Text style={styles.driveCompany}>{drive.company?.name}</Text>
                      <Text style={styles.driveRole}>{drive.jobRole}</Text>
                    </View>
                    <Badge
                      label={drive.status}
                      variant={drive.status === 'PUBLISHED' ? 'success' : 'neutral'}
                    />
                  </View>
                  <View style={styles.driveMeta}>
                    <View style={styles.metaItem}>
                      <IndianRupee color="#64748B" size={14} />
                      <Text style={styles.metaText}>
                        {drive.fixedSalary ? `₹${drive.fixedSalary} LPA` : 'Not disclosed'}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MapPin color="#64748B" size={14} />
                      <Text style={styles.metaText}>{drive.location || 'Any'}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  subGreeting: { fontSize: 14, color: '#64748B', marginTop: 2 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, alignItems: 'center', padding: 14, gap: 6 },
  statIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 10, color: '#64748B', textAlign: 'center', fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  driveCard: { marginBottom: 12 },
  driveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  driveCompany: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  driveRole: { fontSize: 13, color: '#64748B', marginTop: 2 },
  driveMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748B' },
  emptyCard: { alignItems: 'center', gap: 10, paddingVertical: 32 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});
