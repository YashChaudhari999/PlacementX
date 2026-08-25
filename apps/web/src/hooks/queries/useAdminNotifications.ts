import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export const useNotificationStats = () => {
  return useQuery({
    queryKey: ['adminNotificationStats'],
    queryFn: async () => {
      const response = await api.get('/notifications/admin/stats');
      return response.data;
    },
  });
};

export const useNotificationHistory = (params: any) => {
  return useQuery({
    queryKey: ['adminNotificationHistory', params],
    queryFn: async () => {
      const response = await api.get('/notifications/admin/history', { params });
      return response.data;
    },
  });
};

export const useScheduledNotifications = (params: any) => {
  return useQuery({
    queryKey: ['adminScheduledNotifications', params],
    queryFn: async () => {
      const response = await api.get('/notifications/admin/scheduled', { params });
      return response.data;
    },
  });
};

export const useNotificationRecommendations = () => {
  return useQuery({
    queryKey: ['adminNotificationRecommendations'],
    queryFn: async () => {
      const response = await api.get('/notifications/admin/recommendations');
      return response.data;
    },
  });
};

export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: ['adminNotificationTemplates'],
    queryFn: async () => {
      const response = await api.get('/notifications/admin/templates');
      return response.data;
    },
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: any) => {
      const endpoint = payload.scheduledAt 
        ? '/notifications/schedule' 
        : '/notifications/broadcast';
      
      const response = await api.post(endpoint, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Notification sent successfully');
      queryClient.invalidateQueries({ queryKey: ['adminNotificationStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminNotificationHistory'] });
      queryClient.invalidateQueries({ queryKey: ['adminScheduledNotifications'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    }
  });
};
