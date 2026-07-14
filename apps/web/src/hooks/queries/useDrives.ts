import { useQuery } from '@tanstack/react-query';
import { driveService } from '@/services/drives.service';

export const useDrives = () => {
  return useQuery({
    queryKey: ['drives', 'admin'],
    queryFn: driveService.getAllDrives,
  });
};

export const usePublishedDrives = () => {
  return useQuery({
    queryKey: ['drives', 'student'],
    queryFn: async () => {
      const allDrives = await driveService.getAllDrives();
      return allDrives.filter((d: any) => d.status === 'PUBLISHED');
    },
  });
};

export const useDriveDetails = (id?: string) => {
  return useQuery({
    queryKey: ['drive', id],
    queryFn: () => driveService.getDriveDetails(id!),
    enabled: !!id,
  });
};
