import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';

export default function DriveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const [drive, setDrive] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [driveRes, appsRes] = await Promise.all([
          api.get(`/api/student/drives/${id}`, { headers: { 'x-user-id': user?.id } }),
          api.get('/api/student/applications', { headers: { 'x-user-id': user?.id } }),
        ]);
        setDrive(driveRes.data);
        setAlreadyApplied(appsRes.data.some((a: any) => a.driveId === id));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post(`/api/student/drives/${id}/apply`, {}, { headers: { 'x-user-id': user?.id } });
      setAlreadyApplied(true);
      Alert.alert('🎉 Applied!', 'Your application has been submitted successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading || !drive) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: '#94A3B8' }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const details = [
    { icon: 'cash-outline', label: 'Package', value: drive.fixedSalary ? `₹${drive.fixedSalary} LPA` : 'Not Disclosed' },
    { icon: 'laptop-outline', label: 'Work Mode', value: drive.workMode },
    { icon: 'time-outline', label: 'Type', value: drive.employmentType },
    { icon: 'location-outline', label: 'Location', value: drive.location || 'Not specified' },
    { icon: 'school-outline', label: 'Min CGPA', value: drive.minimumCgpa || 'No criteria' },
    { icon: 'git-branch-outline', label: 'Eligible Branches', value: drive.eligibleBranches },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>

        {/* Company Header */}
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{drive.company?.name?.[0]}</Text>
          </View>
          <Text style={styles.company}>{drive.company?.name}</Text>
          <Text style={styles.role}>{drive.jobRole}</Text>
          <Badge
            label={drive.status}
            variant={drive.status === 'PUBLISHED' ? 'success' : 'neutral'}
          />
        </View>

        {/* Details Grid */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Position Details</Text>
          {details.map((d) => (
            <View key={d.label} style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name={d.icon as any} size={16} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <Text style={styles.detailValue}>{d.value || '—'}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Description */}
        {drive.jobDescription && (
          <Card style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.description}>{drive.jobDescription}</Text>
          </Card>
        )}

        {/* Bond */}
        {drive.bondDetails && (
          <Card style={{ marginTop: 12, backgroundColor: '#FFF7ED' }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Ionicons name="warning" size={16} color="#EA580C" />
              <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 18 }}>{drive.bondDetails}</Text>
            </View>
          </Card>
        )}

        {/* Apply Button */}
        <View style={{ marginTop: 24 }}>
          {alreadyApplied ? (
            <Card style={styles.appliedBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              <Text style={styles.appliedText}>You have already applied for this role!</Text>
            </Card>
          ) : (
            <Button
              title="Apply Now"
              onPress={handleApply}
              loading={applying}
              style={styles.applyBtn}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 20, paddingBottom: 48 },
  back: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24,
  },
  hero: { alignItems: 'center', marginBottom: 24, gap: 8 },
  logo: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 28, fontWeight: '800', color: '#4F46E5' },
  company: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  role: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  detailsCard: { gap: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  detailValue: { fontSize: 14, color: '#1E293B', fontWeight: '600', marginTop: 2 },
  description: { fontSize: 14, color: '#475569', lineHeight: 22 },
  appliedBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#86EFAC' },
  appliedText: { fontSize: 14, fontWeight: '600', color: '#16A34A' },
  applyBtn: { backgroundColor: '#4F46E5' },
});
