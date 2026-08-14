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
