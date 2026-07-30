// ─── Admin Notifications Screen (Production) ────────────
// Enterprise-grade notification center with broadcast capabilities.
// Features infinite scroll, time-grouped sections, search,
// category filters, and a broadcast composer modal.

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, TextInput, ActivityIndicator, Modal,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, CheckCircle2, Search, X, Menu, Plus,
  Send, Users, AlertTriangle, ShieldCheck,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

import { theme } from '../../theme/theme';
import { NotificationItem, getTimeGroup } from '../../components/ui/NotificationItem';
import {
  useInfiniteNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useArchiveNotification,
} from '../../hooks/queries/useNotifications';
import { handleDeepLink } from '../../services/deepLink.service';
import type { Notification, NotificationFilters } from '../../types';
import apiClient from '../../lib/apiClient';
import { API_ENDPOINTS } from '../../config/api';

// ─── Filter Tabs ────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'system', label: 'System' },
  { key: 'placement', label: 'Placement' },
  { key: 'interview', label: 'Interview' },
];

// ─── Component ──────────────────────────────────────────

export default function AdminNotificationsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetAudience: 'ALL',
    priority: 'MEDIUM',
    category: 'system',
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Build filters
  const filters: NotificationFilters = useMemo(() => {
    const f: NotificationFilters = {};
    if (activeFilter === 'unread') f.isRead = false;
    else if (activeFilter !== 'all') f.category = activeFilter;
    if (searchQuery.trim()) f.search = searchQuery.trim();
    return f;
  }, [activeFilter, searchQuery]);

  // Queries
  const {
    data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch,
  } = useInfiniteNotifications(filters);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const archiveNotification = useArchiveNotification();

  // Data processing
  const allNotifications = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  const groupedData = useMemo(() => {
    const groups: { title: string; data: Notification[] }[] = [];
    const groupMap = new Map<string, Notification[]>();

    allNotifications.forEach(notification => {
      const group = getTimeGroup(notification.createdAt);
      if (!groupMap.has(group)) groupMap.set(group, []);
      groupMap.get(group)!.push(notification);
    });

    const ORDER = ['Today', 'Yesterday', 'Last 7 Days', 'Earlier'];
    ORDER.forEach(key => {
      if (groupMap.has(key)) groups.push({ title: key, data: groupMap.get(key)! });
    });

    return groups;
  }, [allNotifications]);

  const flatData = useMemo(() => {
    const items: Array<{ type: 'header'; title: string } | { type: 'item'; notification: Notification }> = [];
    groupedData.forEach(group => {
      items.push({ type: 'header', title: group.title });
      group.data.forEach(n => items.push({ type: 'item', notification: n }));
    });
    return items;
  }, [groupedData]);

  // ─── Handlers ──────────────────────────────────────

  const handleNotificationPress = useCallback((notification: Notification) => {
    if (!notification.isRead) markAsRead.mutate(notification.id);
    handleDeepLink(navigation as any, {
      deepLinkRoute: notification.deepLinkRoute,
      deepLinkParams: notification.deepLinkParams,
      notificationId: notification.id,
    });
  }, [navigation, markAsRead]);

  const handleBroadcastSubmit = async () => {
    if (!broadcastForm.title || !broadcastForm.message) return;
    
    setIsBroadcasting(true);
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATION_BROADCAST, {
        title: broadcastForm.title,
        message: broadcastForm.message,
        targetAudience: broadcastForm.targetAudience,
        priority: broadcastForm.priority,
        category: broadcastForm.category,
        type: broadcastForm.category,
      });
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', message: '', targetAudience: 'ALL', priority: 'MEDIUM', category: 'system' });
      refetch();
    } catch (e) {
      console.error('Failed to broadcast:', e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // ─── Render Item ───────────────────────────────────

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
      );
    }
    return (
      <NotificationItem
        notification={item.notification}
        onPress={handleNotificationPress}
        onDelete={(id) => deleteNotification.mutate(id)}
        onArchive={(id) => archiveNotification.mutate(id)}
      />
    );
  }, [handleNotificationPress, deleteNotification, archiveNotification]);

  // ─── Render ────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Header ──────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuBtn}>
            <Menu color="#0f172a" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowSearch(!showSearch)}>
            <Search size={20} color="#64748b" />
          </TouchableOpacity>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
              <CheckCircle2 size={16} color="#4f46e5" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── Search Bar ──────────────────────────────── */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notifications..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ─── Filter Tabs ─────────────────────────────── */}
      <View style={styles.filterContainer}>
        <FlatList
          data={FILTER_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === item.key && styles.filterTabActive]}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text style={[styles.filterTabText, activeFilter === item.key && styles.filterTabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ─── Notification List ────────────────────────── */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item, index) => item.type === 'header' ? `header-${item.title}` : `item-${(item as any).notification.id}`}
          renderItem={renderItem}
          contentContainerStyle={flatData.length === 0 ? styles.emptyContainer : undefined}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={theme.colors.primary} />}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}><Bell size={48} color="#cbd5e1" /></View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyDesc}>You have no notifications matching this criteria.</Text>
            </View>
          }
        />
      )}

      {/* ─── FAB: Broadcast Notification ─────────────── */}
      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setShowBroadcastModal(true)}
      >
        <Send size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ─── Broadcast Modal ─────────────────────────── */}
      <Modal visible={showBroadcastModal} animationType="slide" transparent>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Broadcast</Text>
              <TouchableOpacity onPress={() => setShowBroadcastModal(false)} style={styles.modalClose}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., System Maintenance"
                value={broadcastForm.title}
                onChangeText={t => setBroadcastForm(prev => ({ ...prev, title: t }))}
              />

              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notification body..."
                value={broadcastForm.message}
                onChangeText={t => setBroadcastForm(prev => ({ ...prev, message: t }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Target Audience</Text>
              <View style={styles.rowGroup}>
                {['ALL', 'STUDENT', 'MENTOR'].map(audience => (
                  <TouchableOpacity
                    key={audience}
                    style={[styles.choiceBtn, broadcastForm.targetAudience === audience && styles.choiceBtnActive]}
                    onPress={() => setBroadcastForm(prev => ({ ...prev, targetAudience: audience }))}
                  >
                    <Text style={[styles.choiceText, broadcastForm.targetAudience === audience && styles.choiceTextActive]}>
                      {audience === 'ALL' ? 'Everyone' : audience === 'STUDENT' ? 'Students' : 'Mentors'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.rowGroup}>
                {['LOW', 'MEDIUM', 'HIGH'].map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.choiceBtn, 
                      broadcastForm.priority === priority && styles.choiceBtnActive,
                      broadcastForm.priority === priority && priority === 'HIGH' && { backgroundColor: '#fee2e2', borderColor: '#ef4444' }
                    ]}
                    onPress={() => setBroadcastForm(prev => ({ ...prev, priority }))}
                  >
                    <Text style={[
                      styles.choiceText, 
                      broadcastForm.priority === priority && styles.choiceTextActive,
                      broadcastForm.priority === priority && priority === 'HIGH' && { color: '#b91c1c' }
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, (!broadcastForm.title || !broadcastForm.message) && styles.submitBtnDisabled]}
                onPress={handleBroadcastSubmit}
                disabled={!broadcastForm.title || !broadcastForm.message || isBroadcasting}
              >
                {isBroadcasting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Send size={18} color="#ffffff" />
                    <Text style={styles.submitBtnText}>Send Broadcast</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  unreadBadge: { marginLeft: 8, backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center' },
  unreadBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { padding: 8, borderRadius: 10, backgroundColor: '#f8fafc' },
  markAllBtn: { padding: 10, borderRadius: 10, backgroundColor: '#e0e7ff' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
  filterContainer: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  filterList: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
  filterTabActive: { backgroundColor: '#0f172a' },
  filterTabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterTabTextActive: { color: '#ffffff' },
  sectionHeader: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#94a3b8', fontWeight: '500', textAlign: 'center', paddingHorizontal: 40 },
  
  // FAB
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  modalClose: { padding: 4 },
  modalScroll: { paddingBottom: 40 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 20 },
  textArea: { height: 100 },
  rowGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  choiceBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
  choiceBtnActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  choiceText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  choiceTextActive: { color: '#2563eb' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5', paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 10 },
  submitBtnDisabled: { backgroundColor: '#94a3b8' },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
