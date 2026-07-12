import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, RefreshControl, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function AdminStudents() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/api/admin/students', { headers: { 'x-user-id': user?.id } });
      setStudents(res.data ?? []);
    } catch (e) { console.error(e); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };
  useEffect(() => { fetch(); }, []);

  const filtered = students.filter(
    (s) =>
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentProfile?.branch?.toLowerCase().includes(search.toLowerCase()) ||
      s.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Students Directory</Text>
        <Text style={styles.count}>{students.length} registered</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, branch..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        ) : (
          filtered.map((s) => (
            <Card key={s.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(s.firstName?.[0] ?? s.email?.[0] ?? 'S').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.firstName ? `${s.firstName} ${s.lastName ?? ''}`.trim() : s.email}</Text>
                  <Text style={styles.email}>{s.email}</Text>
                  {s.studentProfile?.branch && (
                    <Text style={styles.branch}>{s.studentProfile.branch}</Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  {s.studentProfile?.cgpa && (
                    <Badge label={`CGPA ${s.studentProfile.cgpa}`} variant="info" />
                  )}
                  {s._count?.applications > 0 && (
                    <Badge label={`${s._count.applications} apps`} variant="neutral" />
                  )}
                </View>
              </View>
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
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 14,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  card: { },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#EA580C' },
  name: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  email: { fontSize: 12, color: '#64748B', marginTop: 1 },
  branch: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
});
