// ─── Notifications Service (Mobile) ─────────────────────
// API client for all notification endpoints with full
// support for pagination, filtering, preferences, and device management.

import apiClient from '../lib/apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { Notification, PaginatedNotifications, NotificationPreferences, NotificationFilters } from '../types';

// ─── Query Parameters Builder ───────────────────────────

const buildQueryParams = (
  filters?: NotificationFilters,
  pagination?: { limit?: number; cursor?: string; offset?: number },
): string => {
  const params = new URLSearchParams();

  if (pagination?.limit) params.set('limit', String(pagination.limit));
  if (pagination?.cursor) params.set('cursor', pagination.cursor);
  if (pagination?.offset) params.set('offset', String(pagination.offset));

  if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.isRead !== undefined) params.set('isRead', String(filters.isRead));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);

  const query = params.toString();
  return query ? `?${query}` : '';
};

// ─── Service API ────────────────────────────────────────

export const notificationsService = {
  /**
   * Get paginated, filtered notifications.
   */
  getNotifications: async (
    filters?: NotificationFilters,
    pagination?: { limit?: number; cursor?: string; offset?: number },
  ): Promise<PaginatedNotifications> => {
    const query = buildQueryParams(filters, pagination);
    const response = await apiClient.get<PaginatedNotifications>(
      `${API_ENDPOINTS.NOTIFICATIONS}${query}`,
    );
    return response.data;
  },

  /**
   * Get unread notification count.
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT);
    return response.data.count;
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATION_READ(id));
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATION_READ_ALL);
  },

  /**
   * Archive a notification.
   */
  archiveNotification: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATION_ARCHIVE(id));
  },

  /**
   * Delete (soft) a notification.
   */
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATION_DELETE(id));
  },

  // ─── Preferences ────────────────────────────────────

  /**
   * Get user notification preferences.
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>(API_ENDPOINTS.NOTIFICATION_PREFERENCES);
    return response.data;
  },

  /**
   * Update user notification preferences.
   */
  updatePreferences: async (prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const response = await apiClient.put<NotificationPreferences>(API_ENDPOINTS.NOTIFICATION_PREFERENCES, prefs);
    return response.data;
  },

  // ─── Device Registration ────────────────────────────

  /**
   * Register device push token.
   */
  registerDevice: async (token: string, platform: string, deviceName?: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.NOTIFICATION_REGISTER_DEVICE, { token, platform, deviceName });
  },

  /**
   * Remove device push token.
   */
  removeDevice: async (token: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATION_REMOVE_DEVICE, { data: { token } });
  },
};
