import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

const TYPE_STYLES: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  ALERT:   { icon: 'warning', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  SUCCESS: { icon: 'checkmark-circle', color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
  WARNING: { icon: 'alert-circle', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  INFO:    { icon: 'information-circle', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/api/notifications', { headers: { 'x-user-id': user?.id } });
      setNotifs(res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) { console.error(e); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetch(); setRefreshing(false); };
  useEffect(() => { fetch(); }, []);

  const markRead = async (id: string) => {
    await api.put(`/api/notifications/${id}/read`, {}, { headers: { 'x-user-id': user?.id } });
    setNotifs((prev) => prev.map((n) => (n.id === id || id === 'all') ? { ...n, isRead: true } : n));
  };

  const displayed = tab === 'unread' ? notifs.filter((n) => !n.isRead) : notifs;
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markRead('all')}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['all', 'unread'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {displayed.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        ) : (
          displayed.map((n) => {
            const t = TYPE_STYLES[n.type] ?? TYPE_STYLES.INFO;
            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.85}
                onPress={() => !n.isRead && markRead(n.id)}
              >
                <View style={[styles.notifCard, { backgroundColor: t.bg, borderColor: t.border }, !n.isRead && styles.unread]}>
                  <View style={[styles.iconWrap, { backgroundColor: '#fff' }]}>
                    <Ionicons name={t.icon as any} size={20} color={t.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.notifTop}>
                      <Text style={[styles.notifTitle, !n.isRead && { color: '#1E293B' }]}>{n.title}</Text>
                      {!n.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMsg} numberOfLines={2}>{n.message}</Text>
                    <Text style={styles.notifTime}>
                      {new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
  markAll: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabActive: { backgroundColor: '#4F46E5' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#fff' },
  list: { padding: 20, paddingTop: 4, paddingBottom: 40, gap: 10 },
  notifCard: {
    flexDirection: 'row', gap: 12, padding: 14,
    borderRadius: 14, borderWidth: 1.5, alignItems: 'flex-start',
  },
  unread: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  notifTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4F46E5' },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#475569', flex: 1 },
  notifMsg: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: '#94A3B8' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
});
