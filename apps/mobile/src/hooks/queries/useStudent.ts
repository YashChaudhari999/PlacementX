import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/student.service';
import type { StudentProfile } from '../../types';
import { ToastAndroid, Platform } from 'react-native';

const showToast = (message: string, isError = false) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
};

export const useStudentProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['studentProfile', userId],
    queryFn: () => studentService.getProfile(userId!),
    enabled: !!userId,
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string, data: Partial<StudentProfile> }) => studentService.updateProfile(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', variables.userId] });
      showToast('Profile updated successfully');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update profile', true);
    }
  });
};

export const useStudentApplications = () => {
  return useQuery({
    queryKey: ['student-applications'],
    queryFn: () => studentService.getApplications(),
  });
};

export const useStudentInterviews = () => {
  return useQuery({
    queryKey: ['student-interviews'],
    queryFn: () => studentService.getInterviews(),
  });
};

export const useStudentDocuments = () => {
  return useQuery({
    queryKey: ['student-documents'],
    queryFn: () => studentService.getDocuments(),
  });
};
