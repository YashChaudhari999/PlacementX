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

export const useAdminStudents = (filters?: any) => {
  return useQuery({
    queryKey: ['adminStudents', filters],
    queryFn: async () => {
      // Assuming getStudents takes filters in query string. Using api directly.
      const { default: api } = await import('@/lib/api');
      const params = new URLSearchParams();
      if (filters?.academic_year) params.append('academic_year', filters.academic_year);
      if (filters?.department) params.append('department', filters.department);
      if (filters?.search) params.append('search', filters.search);
      
      const res = await api.get(`/admin/students?${params.toString()}`);
      return res.data;
    }
  });
};

export const useAdminStudentDetails = (id: string) => {
  return useQuery({
    queryKey: ['adminStudentDetails', id],
    queryFn: async () => {
      const { default: api } = await import('@/lib/api');
      const res = await api.get(`/admin/students/${id}/details`);
      return res.data;
    },
    enabled: !!id
  });
};
