import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/student.service';
import type { StudentProfile } from '../../types';
import { Toast } from '../../components/ui';

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => studentService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StudentProfile>) => studentService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      Toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      Toast.error(error.message || 'Failed to update profile');
    }
  });
};

export const useStudentApplications = () => {
  return useQuery({
    queryKey: ['student-applications'],
    queryFn: () => studentService.getApplications(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentInterviews = () => {
  return useQuery({
    queryKey: ['student-interviews'],
    queryFn: () => studentService.getInterviews(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentDocuments = () => {
  return useQuery({
    queryKey: ['student-documents'],
    queryFn: () => studentService.getDocuments(),
    staleTime: 5 * 60 * 1000,
  });
};
export const useStudentProfileStatus = () => useQuery({
  queryKey: ['student-profile-status'],
  queryFn: () => studentService.getProfileStatus(),
  staleTime: 60 * 1000,
});

export const useRequestProfileUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StudentProfile> & { reason?: string }) => studentService.requestProfileUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile-status'] });
      Toast.success('Profile update request submitted');
    },
    onError: (error: any) => Toast.error(error?.response?.data?.message || error.message || 'Unable to submit request'),
  });
};

