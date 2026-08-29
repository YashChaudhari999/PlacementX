import api from '@/lib/api';

export const notificationService = {
  getNotifications: async (userId: string) => {
    if (!userId) return [];
    const res = await api.get('/notifications', {});
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
};
