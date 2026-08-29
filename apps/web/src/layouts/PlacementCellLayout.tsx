import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/authService';
import {
  LayoutDashboard,
  LineChart,
  Briefcase,
  Users,
  FileText,
  Bell,
  Calendar,
  Settings,
  LogOut,
  Menu,
  Search,
  ChevronDown,
  CheckCircle,
  ShieldCheck,
  FileEdit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui';
import NotificationBell from '@/features/notifications/components/NotificationBell';

export const PlacementCellLayout = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', path: '/admin/analytics', icon: LineChart },
      ],
    },
    {
      title: 'Placements',
      items: [
        { name: 'Placement Drives', path: '/admin/placement-events', icon: Briefcase },
        { name: 'Reports', path: '/admin/reports', icon: FileText },
      ],
    },
    {
      title: 'Student Management',
      items: [
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Verifications', path: '/admin/students/verifications', icon: ShieldCheck },
        { name: 'Update Requests', path: '/admin/students/update-requests', icon: FileEdit },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
        { name: 'Calendar', path: '/admin/calendar', icon: Calendar },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);
  const pageTitle =
    allNavItems.find((item) => location.pathname.startsWith(item.path))?.name || 'Dashboard';

  const sidebarContentJSX = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-4 w-full py-3">
          <div className="bg-white p-1.5 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/10 shrink-0">
            <img src="/nmimslogo.png" alt="NMIMS Logo" className="h-9 w-9 object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-white font-extrabold text-lg leading-none tracking-tight mb-0.5">
              PlacementX
            </span>
            <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] leading-none">
              Admin Portal
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 px-3">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={() =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <Icon
                    className={`h-[18px] w-[18px] transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" /> Super Admin
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
          Secure Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-950 border-r border-slate-800 fixed inset-y-0 z-20 shadow-2xl">
        {sidebarContentJSX}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/80 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-950 shadow-2xl z-50 flex flex-col lg:hidden border-r border-slate-800"
            >
              {sidebarContentJSX}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 hidden sm:block tracking-tight">
                {pageTitle}
              </h1>
              <div className="hidden sm:flex items-center text-xs text-slate-500 font-medium mt-1">
                Admin <span className="mx-2">•</span> {pageTitle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search students, companies, drives..."
                className="pl-10 h-10 bg-slate-100/50 border-transparent hover:border-slate-300 focus:bg-white text-sm focus-visible:ring-primary rounded-full transition-all"
              />
            </div>

            <NotificationBell />

            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors border border-slate-200 hover:border-slate-300 bg-white shadow-sm"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  A
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden sm:block">Admin</span>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 rounded-xl shadow-xl bg-white ring-1 ring-slate-900/5 focus:outline-none overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-semibold text-slate-800">Admin User</p>
                      <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                      </button>
                      <div className="h-px bg-slate-100 my-1 mx-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-medium rounded-md transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[1600px] mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
