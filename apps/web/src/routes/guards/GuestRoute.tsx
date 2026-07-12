import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
export const GuestRoute = ({ children }: { children: ReactNode }) => { const isAuthenticated = false; if (isAuthenticated) return <Navigate to='/student/dashboard' replace />; return <>{children}</>; };
