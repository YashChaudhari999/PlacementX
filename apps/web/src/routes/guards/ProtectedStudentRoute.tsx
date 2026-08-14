import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const ProtectedStudentRoute = ({ children }: { children: ReactNode }) => { 
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) return <Navigate to='/student/login' replace />; 
  if (user?.role !== 'STUDENT') return <Navigate to='/unauthorized' replace />; 
  
  if (user?.profileStatus !== 'VERIFIED' && location.pathname !== '/student/profile') {
    return <Navigate to='/student/profile' replace />;
  }

  return <>{children}</>; 
};
