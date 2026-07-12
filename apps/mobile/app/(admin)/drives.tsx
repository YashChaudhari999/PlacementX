import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function AdminDrives() {
  const { user } = useAuthStore();
  const [drives, setDrives] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/api/admin/drives', { headers: { 'x-user-id': user?.id } });
      setDrives(res.data ?? []);
    } catch (e) { console.error(e); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };
  useEffect(() => { fetch(); }, []);

  const handlePublish = async (id: string) => {
    try {
      await api.put(`/api/admin/drives/${id}/publish`, {}, { headers: { 'x-user-id': user?.id } });
      Alert.alert('Published!', 'Drive is now visible to students.');
      fetch();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to publish');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>All Drives</Text>
        <Text style={styles.count}>{drives.length} total</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {drives.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No drives yet</Text>
            <Text style={styles.emptySub}>Create a drive from the web admin panel</Text>
          </View>
        ) : (
          drives.map((d) => (
            <Card key={d.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>{d.company?.name?.[0] ?? '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.company}>{d.company?.name}</Text>
                  <Text style={styles.role}>{d.jobRole}</Text>
                </View>
                <Badge
                  label={d.status}
                  variant={d.status === 'PUBLISHED' ? 'success' : d.status === 'CLOSED' ? 'danger' : 'neutral'}
                />
              </View>

              <View style={styles.meta}>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{d._count?.applications ?? 0} applications</Text>
                </View>
                {d.fixedSalary && (
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={14} color="#64748B" />
                    <Text style={styles.metaText}>₹{d.fixedSalary} LPA</Text>
                  </View>
                )}
              </View>

              {d.status === 'DRAFT' && (
                <TouchableOpacity style={styles.publishBtn} onPress={() => handlePublish(d.id)}>
                  <Ionicons name="rocket-outline" size={16} color="#fff" />
                  <Text style={styles.publishText}>Publish Drive</Text>
                </TouchableOpacity>
              )}
            </Card>
          ))
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
  list: { padding: 20, paddingTop: 4, paddingBottom: 40, gap: 14 },
  card: { gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: '800', color: '#EA580C' },
  company: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  role: { fontSize: 12, color: '#64748B', marginTop: 2 },
  meta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748B' },
  publishBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#EA580C', borderRadius: 10, paddingVertical: 10,
  },
  publishText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#94A3B8', fontSize: 13 },
});
