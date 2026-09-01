import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useUploadAcademicDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      const res = await api.post('/student/documents/academic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['studentDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload document');
    },
  });
}
