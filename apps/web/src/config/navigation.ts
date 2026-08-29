/**
 * ============================================
 * PlacementX — Navigation Configuration
 * ============================================
 *
 * Centralized navigation maps for Sidebars, Navbars,
 * and Breadcrumb generation.
 */

import { DashboardSquare01Icon, UserCircleIcon, Briefcase01Icon, Note01Icon, Notification01Icon, Settings01Icon, UserMultipleIcon, Calendar01Icon, Task01Icon, BarChartIcon, BotIcon } from 'hugeicons-react';

export const studentNavigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: DashboardSquare01Icon },
  { name: 'Profile', href: '/student/profile', icon: UserCircleIcon },
  { name: 'Placement Drives', href: '/student/placements', icon: Briefcase01Icon },
  { name: 'Applications', href: '/student/applications', icon: Note01Icon },
  { name: 'Notifications', href: '/student/notifications', icon: Notification01Icon },
  { name: 'AI Assistant', href: '/student/ai-assistant', icon: BotIcon }, // Future AI
  { name: 'Settings', href: '/student/settings', icon: Settings01Icon },
];

export const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: DashboardSquare01Icon },
  { name: 'Students', href: '/admin/students', icon: UserMultipleIcon },
  { name: 'Placement Events', href: '/admin/placement-events', icon: Calendar01Icon },
  { name: 'Recruiter Submissions', href: '/admin/recruiter-submissions', icon: Task01Icon },
  { name: 'Notifications', href: '/admin/notifications', icon: Notification01Icon },
  { name: 'Reports', href: '/admin/reports', icon: BarChartIcon },
  { name: 'AI Analytics', href: '/admin/ai-analytics', icon: BotIcon }, // Future AI
  { name: 'Settings', href: '/admin/settings', icon: Settings01Icon },
];

export const publicNavigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Features', href: '/features' },
  { name: 'Contact', href: '/contact' },
];

// Helper for generating breadcrumbs from current path
export const getBreadcrumbs = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);
  return paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    return {
      name: path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '),
      href,
    };
  });
};
