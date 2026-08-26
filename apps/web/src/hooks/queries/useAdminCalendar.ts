import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export const useAdminCalendar = () => {
  return useQuery({
    queryKey: ['admin-calendar'],
    queryFn: async () => {
      const response = await api.get('/admin/calendar');
      return response.data;
    },
    refetchInterval: 60000,
  });
};

export const useCreateCustomEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/admin/calendar/custom', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Event added successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-calendar'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add event');
    }
  });
};

export const useUpdateCustomEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string, [key: string]: any }) => {
      const response = await api.put(`/admin/calendar/custom/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Event updated');
      queryClient.invalidateQueries({ queryKey: ['admin-calendar'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update event');
    }
  });
};

export const useDeleteCustomEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/calendar/custom/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-calendar'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  });
};

export const useRescheduleInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, date, time }: { id: string, date: string, time?: string }) => {
      const response = await api.put(`/admin/calendar/interview/${id}/reschedule`, { date, time });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Interview rescheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-calendar'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reschedule interview');
    }
  });
};
