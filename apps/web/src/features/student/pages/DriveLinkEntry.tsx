import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { loginUrlFor } from '@/features/auth/returnTo';

export default function DriveLinkEntry() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();

  if (!id || !/^[A-Za-z0-9-]{1,64}$/.test(id)) {
    return <Navigate to="/not-found" replace />;
  }

  const destination = `/student/drives/${id}`;
  if (!isAuthenticated) return <Navigate to={loginUrlFor(destination)} replace />;
  if (user?.role !== 'STUDENT') return <Navigate to="/unauthorized" replace />;
  return <Navigate to={destination} replace />;
}
