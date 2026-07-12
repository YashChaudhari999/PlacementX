import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
export const ProtectedStudentRoute = ({ children }: { children: ReactNode }) => { const isAuthenticated = true; const isStudent = true; if (!isAuthenticated) return <Navigate to='/student/login' replace />; if (!isStudent) return <Navigate to='/unauthorized' replace />; return <>{children}</>; };
