import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const GuestRoute = ({ children }: { children: ReactNode }) => { 
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated) {
    if (user?.role === 'STUDENT') return <Navigate to='/student/dashboard' replace />;
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'COORDINATOR') return <Navigate to='/admin/dashboard' replace />;
  }
  
  return <>{children}</>; 
};
