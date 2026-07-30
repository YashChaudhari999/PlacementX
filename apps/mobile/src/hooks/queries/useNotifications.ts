// ─── Notification Query Hooks (Production) ──────────────
// React Query hooks for the notification system with
// infinite scroll, real-time cache invalidation,
// optimistic updates, and preference management.

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { notificationsService } from '../../services/notifications.service';
import { useNotificationStore } from '../../stores/notificationStore';
import { ToastAndroid, Platform } from 'react-native';
import type { NotificationFilters, PaginatedNotifications } from '../../types';

// ─── Helpers ────────────────────────────────────────────

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
};

// ─── Infinite Scroll Notifications ──────────────────────

/**
 * Infinite scroll query for notifications with filtering support.
 * Automatically manages cursor-based pagination.
 */
export const useInfiniteNotifications = (filters?: NotificationFilters) => {
  return useInfiniteQuery<PaginatedNotifications>({
    queryKey: ['notifications', 'infinite', filters],
    queryFn: ({ pageParam }) => {
      return notificationsService.getNotifications(filters, {
        limit: 20,
        cursor: pageParam as string | undefined,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined;
    },
    refetchInterval: 60000, // Refresh every 60s as fallback
  });
};

// ─── Simple Notifications (Legacy Support) ──────────────

export const useNotifications = (limit = 50, offset = 0) => {
  return useQuery({
    queryKey: ['notifications', limit, offset],
    queryFn: async () => {
      const result = await notificationsService.getNotifications(undefined, { limit, offset });
      return result.data;
    },
    refetchInterval: 30000,
  });
};

// ─── Unread Count ───────────────────────────────────────

export const useUnreadCount = () => {
  const { setUnreadCount } = useNotificationStore();

  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count); // Sync to Zustand store
      return count;
    },
    refetchInterval: 30000,
  });
};

// ─── Mark as Read ───────────────────────────────────────

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { decrementUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onMutate: () => {
      // Optimistic: decrement count immediately
      decrementUnreadCount();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: () => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
};

// ─── Mark All as Read ───────────────────────────────────

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { resetUnreadCount } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onMutate: () => {
      resetUnreadCount();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      showToast('All notifications marked as read');
    },
  });
};

// ─── Archive Notification ───────────────────────────────

export const useArchiveNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.archiveNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      showToast('Notification archived');
    },
  });
};

// ─── Delete Notification ────────────────────────────────

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      showToast('Notification deleted');
    },
  });
};

// ─── Notification Preferences ───────────────────────────

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationsService.getPreferences(),
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: Parameters<typeof notificationsService.updatePreferences>[0]) =>
      notificationsService.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      showToast('Preferences updated');
    },
  });
};
