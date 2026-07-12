import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Common Pages
import { Loading } from '@/components/common/Loading';
import { NotFound } from '@/components/common/NotFound';
import { Unauthorized } from '@/components/common/Unauthorized';

// Guards
import { PublicRoute } from './guards/PublicRoute';
import { ProtectedStudentRoute } from './guards/ProtectedStudentRoute';
import { ProtectedAdminRoute } from './guards/ProtectedAdminRoute';
import { GuestRoute } from './guards/GuestRoute';

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { StudentLayout } from '@/layouts/StudentLayout';
import { PlacementCellLayout } from '@/layouts/PlacementCellLayout';
import { RecruiterEventLayout } from '@/layouts/RecruiterEventLayout';

// Lazy loaded page placeholders
// In a real implementation, these would point to actual feature pages
const LazyPage = lazy(() => Promise.resolve({ default: () => <div>Page Content</div> }));

export const router = createBrowserRouter([
  // PUBLIC ROUTES
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'about', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'features', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'contact', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
    ],
  },
  
  // AUTH ROUTES (Guest only)
  {
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [
      { path: 'student/login', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'admin/login', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
    ],
  },

  // STUDENT ROUTES
  {
    path: '/student',
    element: <ProtectedStudentRoute><StudentLayout /></ProtectedStudentRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'profile', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'placements', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'applications', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      // Future AI module placeholder for Student
      { path: 'ai-assistant', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
    ],
  },

  // PLACEMENT CELL (ADMIN) ROUTES
  {
    path: '/admin',
    element: <ProtectedAdminRoute><PlacementCellLayout /></ProtectedAdminRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'students', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'placement-events', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'event/:id', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'recruiter-submissions', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'reports', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      // Future AI module placeholder for Admin
      { path: 'ai-analytics', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
    ],
  },

  // RECRUITER PUBLIC ROUTES (No auth, secure token link)
  {
    path: '/event/:token',
    element: <PublicRoute><RecruiterEventLayout /></PublicRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'success', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'expired', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
    ],
  },

  // COMMON FALLBACKS
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
