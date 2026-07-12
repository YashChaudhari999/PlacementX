import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
export const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => { const isAuthenticated = true; const isAdmin = true; if (!isAuthenticated) return <Navigate to='/admin/login' replace />; if (!isAdmin) return <Navigate to='/unauthorized' replace />; return <>{children}</>; };
