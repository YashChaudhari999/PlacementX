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
import { HrPortalLayout } from '@/layouts/HrPortalLayout';

// Lazy loaded page placeholders
// In a real implementation, these would point to actual feature pages
const LazyPage = lazy(() => Promise.resolve({ default: () => <div>Page Content</div> }));

const LandingPage = lazy(() => import('@/features/public/pages/LandingPage'));
const AboutPage = lazy(() => import('@/features/public/pages/AboutPage'));
const FeaturesPage = lazy(() => import('@/features/public/pages/FeaturesPage'));
const ModulesPage = lazy(() => import('@/features/public/pages/ModulesPage'));
const HowItWorksPage = lazy(() => import('@/features/public/pages/HowItWorksPage'));
const FAQPage = lazy(() => import('@/features/public/pages/FAQPage'));
const ContactPage = lazy(() => import('@/features/public/pages/ContactPage'));

const HrDriveWizard = lazy(() => import('@/features/hr-portal/pages/HrDriveWizard'));
const RecruiterEventDashboard = lazy(() => import('@/features/recruiter/pages/RecruiterEventDashboard'));

const Login = lazy(() => import('@/features/auth/pages/Login'));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const AnalyticsDashboard = lazy(() => import('@/features/admin/pages/AnalyticsDashboard'));
const DriveList = lazy(() => import('@/features/admin/pages/DriveList'));
const CreateDriveWizard = lazy(() => import('@/features/admin/pages/CreateDriveWizard'));
const AdminEventDetails = lazy(() => import('@/features/admin/pages/AdminEventDetails'));
const AdminStudents = lazy(() => import('@/features/admin/pages/AdminStudents'));
const AdminStudentImport = lazy(() => import('@/features/admin/pages/AdminStudentImport'));
const AdminProfileVerifications = lazy(() => import('@/features/admin/pages/AdminProfileVerifications'));
const AdminProfileUpdateRequests = lazy(() => import('@/features/admin/pages/AdminProfileUpdateRequests'));
const AdminReports = lazy(() => import('@/features/admin/pages/AdminReports'));
const AdminNotifications = lazy(() => import('@/features/admin/pages/AdminNotifications'));
const AdminCalendar = lazy(() => import('@/features/admin/pages/AdminCalendar'));
const AdminSettings = lazy(() => import('@/features/admin/pages/AdminSettings'));
const StudentDashboard = lazy(() => import('@/features/student/pages/StudentDashboard'));
const StudentDriveDetails = lazy(() => import('@/features/student/pages/StudentDriveDetails'));
const StudentProfile = lazy(() => import('@/features/student/pages/StudentProfile'));
const StudentApplications = lazy(() => import('@/features/student/pages/StudentApplications'));
const StudentInterviews = lazy(() => import('@/features/student/pages/StudentInterviews'));
const StudentDocuments = lazy(() => import('@/features/student/pages/StudentDocuments'));
const StudentNotifications = lazy(() => import('@/features/student/pages/StudentNotifications'));
const StudentSettings = lazy(() => import('@/features/student/pages/StudentSettings'));

export const router = createBrowserRouter([
  // PUBLIC ROUTES
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'about', element: <Suspense fallback={<Loading />}><AboutPage /></Suspense> },
      { path: 'features', element: <Suspense fallback={<Loading />}><FeaturesPage /></Suspense> },
      { path: 'modules', element: <Suspense fallback={<Loading />}><ModulesPage /></Suspense> },
      { path: 'how-it-works', element: <Suspense fallback={<Loading />}><HowItWorksPage /></Suspense> },
      { path: 'faq', element: <Suspense fallback={<Loading />}><FAQPage /></Suspense> },
      { path: 'contact', element: <Suspense fallback={<Loading />}><ContactPage /></Suspense> },
    ],
  },
  
  // AUTH ROUTES (Guest only)
  {
    path: '/login',
    element: <GuestRoute><AuthLayout /></GuestRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><Login /></Suspense> },
    ],
  },
  // Legacy paths redirect to /login
  { path: '/student/login', element: <Navigate to="/login" replace /> },
  { path: '/admin/login', element: <Navigate to="/login" replace /> },

  // STUDENT ROUTES
  {
    path: '/student',
    element: <ProtectedStudentRoute><StudentLayout /></ProtectedStudentRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<Loading />}><StudentDashboard /></Suspense> },
      { path: 'drives/:id', element: <Suspense fallback={<Loading />}><StudentDriveDetails /></Suspense> },
      { path: 'profile', element: <Suspense fallback={<Loading />}><StudentProfile /></Suspense> },
      { path: 'placements', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'applications', element: <Suspense fallback={<Loading />}><StudentApplications /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<Loading />}><StudentNotifications /></Suspense> },
      { path: 'interviews', element: <Suspense fallback={<Loading />}><StudentInterviews /></Suspense> },
      { path: 'documents', element: <Suspense fallback={<Loading />}><StudentDocuments /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<Loading />}><StudentSettings /></Suspense> },
      // Future AI module placeholder
      { path: 'ai-mock-interview', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'ai-resume-builder', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
    ],
  },

// PLACEMENT CELL (ADMIN) ROUTES
  {
    path: '/admin',
    element: <ProtectedAdminRoute><PlacementCellLayout /></ProtectedAdminRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Suspense fallback={<Loading />}><AdminDashboard /></Suspense> },
      { path: 'analytics', element: <Suspense fallback={<Loading />}><AnalyticsDashboard /></Suspense> },
      { path: 'students', element: <Suspense fallback={<Loading />}><AdminStudents /></Suspense> },
      { path: 'students/import', element: <Suspense fallback={<Loading />}><AdminStudentImport /></Suspense> },
      { path: 'students/verifications', element: <Suspense fallback={<Loading />}><AdminProfileVerifications /></Suspense> },
      { path: 'students/update-requests', element: <Suspense fallback={<Loading />}><AdminProfileUpdateRequests /></Suspense> },
      { path: 'placement-events', element: <Suspense fallback={<Loading />}><DriveList /></Suspense> },
      { path: 'placement-events/create', element: <Suspense fallback={<Loading />}><CreateDriveWizard /></Suspense> },
      { path: 'placement-events/edit/:id', element: <Suspense fallback={<Loading />}><CreateDriveWizard /></Suspense> },
      { path: 'placement-events/:id', element: <Suspense fallback={<Loading />}><AdminEventDetails /></Suspense> },
      { path: 'calendar', element: <Suspense fallback={<Loading />}><AdminCalendar /></Suspense> },
      { path: 'notifications', element: <Suspense fallback={<Loading />}><AdminNotifications /></Suspense> },
      { path: 'reports', element: <Suspense fallback={<Loading />}><AdminReports /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<Loading />}><AdminSettings /></Suspense> },
      // Future AI module placeholder for Admin
      { path: 'ai-analytics', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
    ],
  },

  // RECRUITER PUBLIC ROUTES (No auth, secure token link)
  {
    path: '/event/:token',
    element: <PublicRoute><RecruiterEventLayout /></PublicRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><RecruiterEventDashboard /></Suspense> },
      { path: 'success', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
      { path: 'expired', element: <Suspense fallback={<Loading />}><LazyPage /></Suspense> },
    ],
  },
  
  // HR COLLABORATION PORTAL
  {
    path: '/hr-drive/:token',
    element: <HrPortalLayout />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><HrDriveWizard /></Suspense> },
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
