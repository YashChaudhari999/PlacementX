import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const ProtectedStudentRoute = ({ children }: { children: ReactNode }) => { 
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to='/student/login' replace />; 
  if (user?.role !== 'STUDENT') return <Navigate to='/unauthorized' replace />; 
  
  return <>{children}</>; 
};
