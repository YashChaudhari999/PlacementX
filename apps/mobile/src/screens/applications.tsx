import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, RefreshControl,
} from 'react-native';
import { FileText } from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

const STATUS_MAP: Record<string, { label: string; variant: any }> = {
  APPLIED:                { label: 'Applied', variant: 'info' },
  RESUME_VERIFIED:        { label: 'Resume OK', variant: 'info' },
  ASSESSMENT_SCHEDULED:   { label: 'Test Scheduled', variant: 'warning' },
  ASSESSMENT_CLEARED:     { label: 'Test Cleared', variant: 'success' },
  TECHNICAL_INTERVIEW:    { label: 'Tech Interview', variant: 'warning' },
  HR_INTERVIEW:           { label: 'HR Round', variant: 'warning' },
  SELECTED:               { label: '🎉 Selected!', variant: 'success' },
  REJECTED:               { label: 'Not Selected', variant: 'danger' },
};

export default function ApplicationsScreen() {
  const { user } = useAuthStore();
  const [apps, setApps] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/api/student/applications', { headers: { 'x-user-id': user?.id } });
      setApps(res.data);
    } catch (e) { console.error(e); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };
  useEffect(() => { fetch(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>My Applications</Text>
        <Text style={styles.count}>{apps.length} total</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {apps.length === 0 ? (
          <View style={styles.empty}>
            <FileText size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No applications yet</Text>
            <Text style={styles.emptySub}>Browse drives and apply to get started!</Text>
          </View>
        ) : (
          apps.map((app) => {
            const statusInfo = STATUS_MAP[app.status] ?? { label: app.status, variant: 'neutral' };
            return (
              <Card key={app.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>{app.drive?.company?.name?.[0] ?? '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.company}>{app.drive?.company?.name}</Text>
                    <Text style={styles.role}>{app.drive?.jobRole}</Text>
                  </View>
                  <Badge label={statusInfo.label} variant={statusInfo.variant} />
                </View>

                {/* Status Timeline */}
                <View style={styles.timeline}>
                  {['APPLIED', 'RESUME_VERIFIED', 'ASSESSMENT_CLEARED', 'SELECTED'].map((step, i) => {
                    const steps = Object.keys(STATUS_MAP);
                    const currentIndex = steps.indexOf(app.status);
                    const stepIndex = steps.indexOf(step);
                    const done = currentIndex >= stepIndex;
                    return (
                      <View key={step} style={styles.timelineItem}>
                        <View style={[styles.dot, done ? styles.dotDone : styles.dotPending]} />
                        {i < 3 && <View style={[styles.line, done && i < currentIndex - 1 ? styles.lineDone : styles.linePending]} />}
                        <Text style={[styles.stepLabel, done ? styles.stepDone : styles.stepPending]}>
                          {STATUS_MAP[step]?.label ?? step}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.appliedOn}>
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  count: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  list: { padding: 20, paddingBottom: 40, gap: 14 },
  card: { gap: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  company: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  role: { fontSize: 12, color: '#64748B', marginTop: 2 },
  timeline: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 4 },
  timelineItem: { flex: 1, alignItems: 'center', position: 'relative' },
  dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  dotDone: { backgroundColor: '#4F46E5' },
  dotPending: { backgroundColor: '#E2E8F0' },
  line: { position: 'absolute', top: 4, left: '55%', right: '-55%', height: 2 },
  lineDone: { backgroundColor: '#4F46E5' },
  linePending: { backgroundColor: '#E2E8F0' },
  stepLabel: { fontSize: 9, textAlign: 'center', fontWeight: '600' },
  stepDone: { color: '#4F46E5' },
  stepPending: { color: '#CBD5E1' },
  appliedOn: { fontSize: 11, color: '#94A3B8', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#94A3B8', fontSize: 13 },
});
