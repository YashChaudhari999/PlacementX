import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { ToastAndroid, Platform } from 'react-native';

const showToast = (message: string, isError = false) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboardData(),
  });
};

export const useAdminStudents = () => {
  return useQuery({
    queryKey: ['admin-students'],
    queryFn: () => adminService.getStudents(),
  });
};

export const useAdminCoordinators = () => {
  return useQuery({
    queryKey: ['admin-coordinators'],
    queryFn: () => adminService.getCoordinators(),
  });
};

export const useAddCoordinator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.addCoordinator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coordinators'] });
      showToast('Coordinator added successfully');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to add coordinator', true);
    }
  });
};

export const useAdminCalendar = () => {
  return useQuery({
    queryKey: ['admin-calendar'],
    queryFn: () => adminService.getCalendarEvents(),
    refetchInterval: 60000,
  });
};

export const useAdminReportsData = () => {
  return useQuery({
    queryKey: ['admin-reports-data'],
    queryFn: () => adminService.getReportsData(),
  });
};

export const usePendingProfiles = () => {
  return useQuery({
    queryKey: ['admin-pending-profiles'],
    queryFn: () => adminService.getPendingProfiles(),
  });
};

export const useVerifyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, remarks }: { id: string; action: 'APPROVE' | 'REJECT'; remarks?: string }) =>
      adminService.verifyProfile(id, action, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      showToast('Profile verification status updated');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to verify profile', true);
    }
  });
};
