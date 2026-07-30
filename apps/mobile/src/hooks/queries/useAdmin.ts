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
