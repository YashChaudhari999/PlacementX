import { apiClient } from '@/lib/apiClient';

export const notificationService = {
  getNotifications: async (userId: string) => {
    if (!userId) return [];
    const res = await apiClient.get('/notifications', {
      headers: { 'x-user-id': userId }
    });
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  }
};
