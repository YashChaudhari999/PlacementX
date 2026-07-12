import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => { 
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to='/admin/login' replace />; 
  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'COORDINATOR') return <Navigate to='/unauthorized' replace />; 
  
  return <>{children}</>; 
};
