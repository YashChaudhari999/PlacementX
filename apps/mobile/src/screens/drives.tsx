import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { Search, Briefcase, IndianRupee, Laptop, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function DrivesScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [drives, setDrives] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/api/student/drives', { headers: { 'x-user-id': user?.id } });
      setDrives(res.data);
    } catch (e) { console.error(e); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };
  useEffect(() => { fetch(); }, []);

  const filtered = drives.filter(
    (d) =>
      d.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.jobRole?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Placement Drives</Text>
        <Text style={styles.count}>{drives.length} active</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by company or role..."
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
            <Briefcase size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No drives found</Text>
          </View>
        ) : (
          filtered.map((drive) => (
            <TouchableOpacity
              key={drive.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DriveDetails', { id: drive.id })}
            >
              <Card style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>
                      {drive.company?.name?.[0] ?? '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.company}>{drive.company?.name}</Text>
                    <Text style={styles.role}>{drive.jobRole}</Text>
                  </View>
                  <Badge
                    label={drive.status}
                    variant={drive.status === 'PUBLISHED' ? 'success' : 'neutral'}
                  />
                </View>

                <View style={styles.chips}>
                  {drive.fixedSalary && (
                    <View style={styles.chip}>
                      <IndianRupee size={12} color="#4F46E5" />
                      <Text style={styles.chipText}>₹{drive.fixedSalary} LPA</Text>
                    </View>
                  )}
                  {drive.workMode && (
                    <View style={styles.chip}>
                      <Laptop size={12} color="#4F46E5" />
                      <Text style={styles.chipText}>{drive.workMode}</Text>
                    </View>
                  )}
                  {drive.employmentType && (
                    <View style={styles.chip}>
                      <Clock size={12} color="#4F46E5" />
                      <Text style={styles.chipText}>{drive.employmentType}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cgpa}>Min CGPA: {drive.minimumCgpa || 'Any'}</Text>
                  <Text style={styles.viewMore}>View Details →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  count: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 16,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  card: { gap: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoPlaceholder: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: '800', color: '#4F46E5' },
  company: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  role: { fontSize: 13, color: '#64748B', marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#4F46E5' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  cgpa: { fontSize: 12, color: '#64748B' },
  viewMore: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
});
