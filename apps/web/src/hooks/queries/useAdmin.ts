import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

export const usePendingProfiles = () => {
  return useQuery({
    queryKey: ['adminPendingProfiles'],
    queryFn: () => adminService.getPendingProfiles(),
  });
};

export const useVerifyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string, action: 'APPROVE' | 'REJECT', reason?: string }) => 
      adminService.verifyProfile(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingProfiles'] });
      toast.success('Profile verification updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify profile');
    }
  });
};

export const useUpdateRequests = () => {
  return useQuery({
    queryKey: ['adminUpdateRequests'],
    queryFn: () => adminService.getUpdateRequests(),
  });
};

export const useReviewUpdateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string, action: 'APPROVE' | 'REJECT', reason?: string }) => 
      adminService.reviewUpdateRequest(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUpdateRequests'] });
      toast.success('Update request processed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to review update request');
    }
  });
};

export const useProvisionStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminService.provisionCurrentYearStudents(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success('Students provisioned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to provision students');
    }
  });
};

export const useAdminStudents = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['adminStudents', params],
    queryFn: () => adminService.getStudents(params),
    placeholderData: (prev: any) => prev, // keep previous data while loading new page
  });
};

export const useStudentStats = (academicYear?: string) => {
  return useQuery({
    queryKey: ['adminStudentStats', academicYear],
    queryFn: () => adminService.getStudentStats(academicYear),
  });
};
