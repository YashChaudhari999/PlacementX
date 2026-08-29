import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useNotifications = (limit: any = 10, offset: any = 0) => {
  const parsedLimit = typeof limit === 'number' && !isNaN(limit) ? limit : 10;
  const parsedOffset = typeof offset === 'number' && !isNaN(offset) ? offset : 0;
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', parsedLimit, parsedOffset],
    queryFn: async () => {
      const res = await api.get(`/notifications`, {
        params: { limit: parsedLimit, offset: parsedOffset },
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });
};

export const useUnreadCount = () => {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await api.get(`/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.count as number;
    },
    enabled: !!token,
    refetchInterval: 60000, // Fallback polling
  });
};

export const useMarkAsRead = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(
        `/notifications/read/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch(
        `/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkNotificationRead = useMarkAsRead;
export const useMarkAllNotificationsRead = useMarkAllAsRead;
