import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { drivesService } from '../../services/drives.service';
import type { Drive } from '../../types';

export const useAdminDrives = () => {
  return useQuery({
    queryKey: ['admin-drives'],
    queryFn: () => drivesService.getAdminDrives(),
  });
};

export const usePublishedDrives = () => {
  return useQuery({
    queryKey: ['published-drives'],
    queryFn: () => drivesService.getPublishedDrives(),
  });
};

export const useDriveDetails = (id?: string) => {
  return useQuery({
    queryKey: ['drive', id],
    queryFn: () => drivesService.getDriveDetails(id!),
    enabled: !!id,
  });
};

export const useCheckEligibility = (id?: string) => {
  return useQuery({
    queryKey: ['drive-eligibility', id],
    queryFn: () => drivesService.checkEligibility(id!),
    enabled: !!id,
  });
};

export const useApplyForDrive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => drivesService.applyForDrive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['drive-eligibility', id] });
      queryClient.invalidateQueries({ queryKey: ['published-drives'] });
      queryClient.invalidateQueries({ queryKey: ['student-applications'] });
    },
  });
};
