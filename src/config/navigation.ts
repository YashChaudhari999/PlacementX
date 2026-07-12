/**
 * ============================================
 * PlacementX — Navigation Configuration
 * ============================================
 * 
 * Centralized navigation maps for Sidebars, Navbars, 
 * and Breadcrumb generation.
 */

import {
  LayoutDashboard,
  UserCircle,
  Briefcase,
  FileText,
  Bell,
  Settings,
  Users,
  Calendar,
  ClipboardList,
  BarChart,
  Bot
} from 'lucide-react';

export const studentNavigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/student/profile', icon: UserCircle },
  { name: 'Placement Drives', href: '/student/placements', icon: Briefcase },
  { name: 'Applications', href: '/student/applications', icon: FileText },
  { name: 'Notifications', href: '/student/notifications', icon: Bell },
  { name: 'AI Assistant', href: '/student/ai-assistant', icon: Bot }, // Future AI
  { name: 'Settings', href: '/student/settings', icon: Settings },
];

export const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Placement Events', href: '/admin/placement-events', icon: Calendar },
  { name: 'Recruiter Submissions', href: '/admin/recruiter-submissions', icon: ClipboardList },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Reports', href: '/admin/reports', icon: BarChart },
  { name: 'AI Analytics', href: '/admin/ai-analytics', icon: Bot }, // Future AI
  { name: 'Settings', href: '/admin/settings', icon: Settings },
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
