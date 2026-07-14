import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/authService';
import { 
  LayoutDashboard, Briefcase, FileText, Bell, Calendar, Settings, 
  LogOut, Menu, Search, ChevronDown, User, GraduationCap, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { useFCMToken } from '@/hooks/useFCMToken';

export const StudentLayout = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { unreadCount } = useNotifications();

  // Register for FCM tokens
  useFCMToken(user);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/student/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Applications', path: '/student/applications', icon: Briefcase },
    { name: 'Interviews', path: '/student/interviews', icon: Calendar },
    { name: 'Documents', path: '/student/documents', icon: FileText },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const pageTitle = navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
      <div className="h-24 flex items-center justify-center px-6 border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">NMIMS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 scrollbar-hide">
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
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 transform scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1 tracking-wide">{item.name}</span>
              {isNotif && unreadCount > 0 && (
                <span className={`ml-auto text-[10px] font-black px-2 py-1 rounded-full ${isActive ? 'bg-white text-primary' : 'bg-red-500 text-white shadow-sm'}`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
      
      {/* Profile Completion Widget */}
      <div className="px-4 py-6 border-t border-slate-100/50 bg-slate-50/50 rounded-b-3xl">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-bold text-slate-700">Profile Strength</span>
            </div>
            <span className="text-xs font-black text-emerald-600">100%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full"
            />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/4" />

      {/* Desktop Sidebar (Floating) */}
      <aside className="hidden lg:flex flex-col w-[300px] fixed inset-y-0 z-20 p-6">
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
              className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[300px] z-50 flex flex-col lg:hidden p-4"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[300px] min-w-0 relative z-10">
        {/* Dynamic Header */}
        <header className="h-24 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 -ml-2 text-slate-700 bg-white shadow-sm rounded-xl border border-slate-200"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 hidden sm:block tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-sm font-medium text-slate-500 hidden sm:block mt-0.5">Let's find your dream job today.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search jobs, companies..." 
                className="pl-11 h-12 bg-white border-slate-200 hover:border-slate-300 focus:bg-white text-sm focus-visible:ring-primary focus-visible:border-primary rounded-2xl shadow-sm transition-all font-medium"
              />
            </div>
            
            <button className="relative p-3 text-slate-600 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-primary hover:text-primary transition-colors group">
              <Bell className="h-5 w-5 group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
              <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}&backgroundColor=f1f5f9`} alt="avatar" className="h-full w-full object-cover" />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-bold text-slate-800 leading-tight">{user?.email?.split('@')[0]}</span>
                  <span className="text-xs font-semibold text-slate-400">B.Tech CS</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 ml-1 hidden sm:block" />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-4 w-64 rounded-2xl shadow-2xl bg-white border border-slate-100 overflow-hidden"
                  >
                    <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white text-center">
                      <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 mb-3 overflow-hidden shadow-inner">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}&backgroundColor=f1f5f9`} alt="avatar" className="h-full w-full object-cover" />
                      </div>
                      <p className="text-base font-bold text-slate-800">{user?.email?.split('@')[0]}</p>
                      <p className="text-sm font-medium text-slate-500 mt-0.5 truncate">{user?.email}</p>
                    </div>
                    <div className="p-3">
                      <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-3">
                        <User className="w-4 h-4 text-slate-400" /> View Profile
                      </button>
                      <button className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-3">
                        <Settings className="w-4 h-4 text-slate-400" /> Preferences
                      </button>
                      <div className="h-px bg-slate-100 my-2 mx-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
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
        <main className="flex-1 px-6 sm:px-10 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[1400px] mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
