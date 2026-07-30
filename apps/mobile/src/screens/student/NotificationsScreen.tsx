// ─── Student Notifications Screen (Production) ──────────
// Enterprise-grade notification center inspired by LinkedIn
// and Instagram. Features infinite scroll, category filters,
// time-grouped sections, search, and deep link navigation.

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, CheckCircle2, Search, X, Filter,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

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

// ─── Filter Tabs ────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'placement', label: 'Placement' },
  { key: 'interview', label: 'Interview' },
  { key: 'meeting', label: 'Meeting' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'message', label: 'Messages' },
  { key: 'reminder', label: 'Reminder' },
  { key: 'system', label: 'System' },
];

// ─── Component ──────────────────────────────────────────

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Build filters from active state
  const filters: NotificationFilters = useMemo(() => {
    const f: NotificationFilters = {};
    if (activeFilter === 'unread') {
      f.isRead = false;
    } else if (activeFilter !== 'all') {
      f.category = activeFilter;
    }
    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }
    return f;
  }, [activeFilter, searchQuery]);

  // Queries
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteNotifications(filters);

  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const archiveNotification = useArchiveNotification();

  // Flatten pages into grouped data
  const allNotifications = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data);
  }, [data]);

  // Group by time
  const groupedData = useMemo(() => {
    const groups: { title: string; data: Notification[] }[] = [];
    const groupMap = new Map<string, Notification[]>();

    allNotifications.forEach(notification => {
      const group = getTimeGroup(notification.createdAt);
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group)!.push(notification);
    });

    // Maintain order: Today, Yesterday, Last 7 Days, Earlier
    const ORDER = ['Today', 'Yesterday', 'Last 7 Days', 'Earlier'];
    ORDER.forEach(key => {
      if (groupMap.has(key)) {
        groups.push({ title: key, data: groupMap.get(key)! });
      }
    });

    return groups;
  }, [allNotifications]);

  // Flatten for FlatList (with section headers)
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
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    // Deep link to target screen
    handleDeepLink(navigation as any, {
      deepLinkRoute: notification.deepLinkRoute,
      deepLinkParams: notification.deepLinkParams,
      notificationId: notification.id,
    });
  }, [navigation, markAsRead]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search size={20} color="#64748b" />
          </TouchableOpacity>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCircle2 size={16} color="#4f46e5" />
              <Text style={styles.markAllText}>Mark all read</Text>
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
              style={[
                styles.filterTab,
                activeFilter === item.key && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === item.key && styles.filterTabTextActive,
                ]}
              >
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
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${item.title}` : `item-${(item as any).notification.id}`
          }
          renderItem={renderItem}
          contentContainerStyle={flatData.length === 0 ? styles.emptyContainer : undefined}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Bell size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === 'unread'
                  ? 'All Caught Up!'
                  : activeFilter !== 'all'
                    ? `No ${activeFilter} notifications`
                    : 'No Notifications Yet'
                }
              </Text>
              <Text style={styles.emptyDesc}>
                {activeFilter === 'unread'
                  ? "You've read all your notifications."
                  : activeFilter !== 'all'
                    ? `You don't have any ${activeFilter} notifications.`
                    : "When you get notifications, they'll show up here."
                }
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  unreadBadge: {
    marginLeft: 8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338ca',
  },
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  // Filters
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterTabActive: {
    backgroundColor: '#0f172a',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  // Section Headers
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Footer
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
