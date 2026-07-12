import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

const TYPES = [
  { value: 'INFO', label: 'General Info', color: '#2563EB', bg: '#DBEAFE', icon: 'information-circle' },
  { value: 'SUCCESS', label: 'Success', color: '#16A34A', bg: '#DCFCE7', icon: 'checkmark-circle' },
  { value: 'WARNING', label: 'Warning', color: '#D97706', bg: '#FEF3C7', icon: 'alert-circle' },
  { value: 'ALERT', label: 'Urgent Alert', color: '#DC2626', bg: '#FEE2E2', icon: 'warning' },
];

const AUDIENCES = [
  { value: 'ALL', label: 'All Students' },
  { value: 'B.Tech CS', label: 'B.Tech CS' },
  { value: 'B.Tech IT', label: 'B.Tech IT' },
  { value: 'B.Tech EXTC', label: 'B.Tech EXTC' },
  { value: 'MBA Tech', label: 'MBA Tech' },
];

export default function AdminNotifications() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ title: '', message: '', link: '', type: 'INFO', targetBranch: 'ALL' });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!form.title || !form.message) {
      Alert.alert('Error', 'Title and message are required');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/api/admin/notifications/broadcast', form, {
        headers: { 'x-user-id': user?.id },
      });
      Alert.alert('✅ Sent!', res.data.message);
      setForm({ title: '', message: '', link: '', type: 'INFO', targetBranch: 'ALL' });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = TYPES.find((t) => t.value === form.type)!;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Broadcast</Text>
          <Text style={styles.sub}>Send targeted notifications to students</Text>

          {/* Type Selector */}
          <Text style={styles.label}>Notification Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, form.type === t.value && { backgroundColor: t.bg, borderColor: t.color, borderWidth: 2 }]}
                onPress={() => setForm({ ...form, type: t.value })}
              >
                <Ionicons name={t.icon as any} size={16} color={form.type === t.value ? t.color : '#94A3B8'} />
                <Text style={[styles.typeText, form.type === t.value && { color: t.color }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Audience */}
          <Text style={styles.label}>Target Audience</Text>
          <View style={styles.audienceRow}>
            {AUDIENCES.map((a) => (
              <TouchableOpacity
                key={a.value}
                style={[styles.audienceChip, form.targetBranch === a.value && styles.audienceActive]}
                onPress={() => setForm({ ...form, targetBranch: a.value })}
              >
                <Text style={[styles.audienceText, form.targetBranch === a.value && styles.audienceTextActive]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Title"
            placeholder="e.g., Amazon drive applications open!"
            value={form.title}
            onChangeText={(v) => setForm({ ...form, title: v })}
            containerStyle={{ marginTop: 4 }}
          />

          <Input
            label="Message"
            placeholder="Write your announcement here..."
            value={form.message}
            onChangeText={(v) => setForm({ ...form, message: v })}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
            containerStyle={{ marginTop: 16 }}
          />

          <Input
            label="Action Link (optional)"
            placeholder="https://..."
            value={form.link}
            onChangeText={(v) => setForm({ ...form, link: v })}
            keyboardType="url"
            containerStyle={{ marginTop: 16 }}
            leftIcon={<Ionicons name="link-outline" size={16} color="#94A3B8" />}
          />

          {/* Preview */}
          <Card style={StyleSheet.flatten([styles.preview, { backgroundColor: selectedType.bg, borderColor: selectedType.color, borderWidth: 1.5 }])}>
            <View style={styles.previewHeader}>
              <Ionicons name={selectedType.icon as any} size={18} color={selectedType.color} />
              <Text style={[styles.previewTitle, { color: selectedType.color }]}>
                {form.title || 'Notification title preview'}
              </Text>
            </View>
            <Text style={styles.previewMsg}>{form.message || 'Message body will appear here...'}</Text>
          </Card>

          <Button title="Send Notification" onPress={handleSend} loading={loading} style={styles.sendBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  sub: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 16 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: 'transparent',
  },
  typeText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  audienceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  audienceChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: 'transparent',
  },
  audienceActive: { backgroundColor: '#FFF7ED', borderColor: '#EA580C' },
  audienceText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  audienceTextActive: { color: '#EA580C' },
  preview: { marginTop: 20, gap: 8 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  previewMsg: { fontSize: 13, color: '#475569', lineHeight: 18 },
  sendBtn: { marginTop: 20, backgroundColor: '#EA580C' },
});
