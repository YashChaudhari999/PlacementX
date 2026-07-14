import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/authService';
import { 
  LayoutDashboard, Briefcase, FileText, Bell, Calendar, Settings, 
  LogOut, Menu, Search, ChevronDown, User, CheckCircle, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';

export const StudentLayout = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/student/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/student/profile', icon: User },
    { name: 'Applications', path: '/student/applications', icon: Briefcase },
    { name: 'Interviews', path: '/student/interviews', icon: Calendar },
    { name: 'Documents', path: '/student/documents', icon: FileText },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const pageTitle = navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard';

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-primary">
          <Briefcase className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight">PlacementX</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
          Student Portal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          const isNotif = item.path === '/student/notifications';
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={() =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="flex-1">{item.name}</span>
              {isNotif && unreadCount > 0 && (
                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
      
      {/* Profile Completion Widget in Sidebar */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800">Profile Complete</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 text-slate-500" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0 z-20">
        <SidebarContent />
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
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search drives, notices..." 
                className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm focus-visible:ring-1"
              />
            </div>
            
            {/* Download App Button */}
            <a
              href="/placementx-student-app.apk"
              download="PlacementX_Student.apk"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download App</span>
            </a>

            <button 
              onClick={() => navigate('/student/notifications')}
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-700 leading-none">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role.replace('_', ' ').toLowerCase()}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
              </button>
              
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                      <p className="text-sm font-medium text-slate-800">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
