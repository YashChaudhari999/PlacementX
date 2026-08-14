import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { toast } from 'sonner';

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
    mutationFn: ({ userId, data }: { userId: string, data: any }) => studentService.updateProfile(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile', variables.userId] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });
};

export const useStudentMLPrediction = (userId?: string, profileData?: any) => {
  return useQuery({
    queryKey: ['studentMLPrediction', userId],
    queryFn: () => studentService.getMLPrediction(userId!, profileData),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

