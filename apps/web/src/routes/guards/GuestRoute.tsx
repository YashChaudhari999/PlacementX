import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getSafeReturnTo } from '@/features/auth/returnTo';

export const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (isAuthenticated) {
    const returnTo = getSafeReturnTo(new URLSearchParams(location.search).get('returnTo'));
    if (user?.role === 'STUDENT') return <Navigate to={returnTo || '/student/dashboard'} replace />;
    if (user?.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'COORDINATOR') return <Navigate to="/admin/students" replace />;
  }

  return <>{children}</>;
};
