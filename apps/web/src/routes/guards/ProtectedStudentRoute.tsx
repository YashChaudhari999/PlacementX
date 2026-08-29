import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLocation } from 'react-router-dom';
import { ProfileUnderReview } from '@/components/common/ProfileUnderReview';

export const ProtectedStudentRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
<<<<<<< HEAD
  
  if (!isAuthenticated) return <Navigate to='/login' replace />; 
  if (user?.role !== 'STUDENT') return <Navigate to='/unauthorized' replace />; 
  
  // If profile is not verified, show a proper explanation page
  // EXCEPT when on the profile page itself so they can still edit/submit
  if (user?.profileStatus !== 'VERIFIED' && location.pathname !== '/student/profile') {
    return <ProfileUnderReview />;
=======

  if (!isAuthenticated) return <Navigate to="/student/login" replace />;
  if (user?.role !== 'STUDENT') return <Navigate to="/unauthorized" replace />;

  if (user?.profileStatus !== 'VERIFIED' && location.pathname !== '/student/profile') {
    return <Navigate to="/student/profile" replace />;
>>>>>>> f85e2cd8ecf38ea6ee820203cd917adcf9b68528
  }

  return <>{children}</>;
};
