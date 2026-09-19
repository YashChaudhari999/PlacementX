import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/authService';
import {
 DashboardSquare01Icon,
 ChartLineData01Icon,
 Briefcase01Icon,
 UserMultipleIcon,
 Note01Icon,
 Notification01Icon,
 Calendar01Icon,
 Settings01Icon,
 Logout01Icon,
 Menu01Icon,
 ArrowDown01Icon,
 Tick02Icon,
 Shield01Icon,
 FileEditIcon,
} from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { GlobalLoader } from '@/components/ui/feedback';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';

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

 const isSuperAdmin = user?.role === 'SUPER_ADMIN';
 const navGroups = [
 {
 title: 'Overview',
 items: isSuperAdmin ? [
 { name: 'Dashboard', href: '/admin/dashboard', icon: DashboardSquare01Icon },
 { name: 'Analytics', href: '/admin/analytics', icon: ChartLineData01Icon },
 ] : [],
 },
 {
 title: 'Placements',
 items: isSuperAdmin ? [
 { name: 'Placement Drives', href: '/admin/placement-events', icon: Briefcase01Icon },
 { name: 'Reports', href: '/admin/reports', icon: Note01Icon },
 ] : [],
 },
 {
 title: 'Student Management',
 items: [
 { name: 'Students', href: '/admin/students', icon: UserMultipleIcon },
 { name: 'Verifications', href: '/admin/students/verifications', icon: Shield01Icon },
 { name: 'Update Requests', href: '/admin/students/update-requests', icon: FileEditIcon },
 ],
 },
 {
 title: 'System',
 items: isSuperAdmin ? [
 { name: 'Notifications', href: '/admin/notifications', icon: Notification01Icon },
 { name: 'Calendar', href: '/admin/calendar', icon: Calendar01Icon },
 { name: 'Settings', href: '/admin/settings', icon: Settings01Icon },
 ] : [],
 },
 ];

 const allNavItems = navGroups.flatMap((g) => g.items);
 const pageTitle =
 allNavItems.find((item) => location.pathname.startsWith(item.href))?.name || 'Dashboard';

 const sidebarLogo = (
 <button
 onClick={() => navigate(isSuperAdmin ? '/admin/dashboard' : '/admin/students')}
 className="flex items-center gap-2 transition-opacity hover:opacity-80 w-full"
 >
 <div className="bg-white p-1.5 rounded-lg flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
 <img
 src="/nmimslogo_transparent.png"
 alt="NMIMS Logo"
 className="h-7 w-7 object-contain"
 />
 </div>
 <div className="flex flex-col text-left hidden lg:block">
 <span className="font-extrabold text-[15px] leading-tight text-foreground tracking-tight">
 PlacementX
 </span>
 <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">
 Admin
 </span>
 </div>
 </button>
 );

 const sidebarFooter = (
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted border border-border">
 <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm">
 A
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-foreground truncate">{user?.firstName || 'Placement User'}</p>
 <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
 <Tick02Icon className="w-3 h-3 text-success"/> {isSuperAdmin ? 'Super Admin' : 'Coordinator'}
 </p>
 </div>
 </div>
 <Button
 variant="outline"
 onClick={handleLogout}
 className="w-full gap-2 text-destructive hover:bg-destructive/10 border-border h-9"
 >
 <Logout01Icon className="h-4 w-4"/>
 Secure Sign Out
 </Button>
 </div>
 );

 return (
 <div className="flex min-h-screen bg-background relative overflow-hidden text-foreground">
 {/* Desktop Sidebar */}
 <aside className="hidden lg:flex flex-col w-[280px] fixed inset-y-0 z-20">
 <Sidebar groups={navGroups} logo={sidebarLogo} footer={sidebarFooter} />
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
 className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
 />
 <motion.aside
 initial={{ x: '-100%' }}
 animate={{ x: 0 }}
 exit={{ x: '-100%' }}
 transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
 className="fixed inset-y-0 left-0 w-[280px] z-50 flex flex-col lg:hidden"
 >
 <Sidebar
 groups={navGroups}
 logo={sidebarLogo}
 footer={sidebarFooter}
 onItemClick={() => setIsMobileMenuOpen(false)}
 />
 </motion.aside>
 </>
 )}
 </AnimatePresence>

 {/* Main Content Area */}
 <div className="flex-1 flex flex-col lg:pl-[280px] min-w-0 relative z-10 transition-all">
 {/* Dynamic Header */}
 <header className="h-16 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setIsMobileMenuOpen(true)}
 className="lg:hidden p-2 -ml-2 text-muted-foreground hover:bg-muted rounded-md"
 >
 <Menu01Icon className="h-5 w-5"/>
 </button>
 <div>
 <h1 className="text-xl font-bold text-foreground hidden sm:block tracking-tight">
 {pageTitle}
 </h1>
 <div className="hidden sm:flex items-center text-xs text-muted-foreground font-medium mt-0.5">
 Admin <span className="mx-2 text-border">•</span> {pageTitle}
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4 sm:gap-6">
 <NotificationBell />

 <div className="relative">
 <button
 onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
 className="flex items-center gap-2 hover:bg-muted p-1 pr-2 rounded-full transition-colors border border-border bg-card shadow-sm"
 >
 <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-inner">
 A
 </div>
 <span className="text-sm font-semibold text-foreground hidden sm:block">Admin</span>
 <ArrowDown01Icon className="h-4 w-4 text-muted-foreground hidden sm:block"/>
 </button>

 <AnimatePresence>
 {isProfileDropdownOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 mt-3 w-56 rounded-xl shadow-dropdown bg-popover border border-border overflow-hidden"
 >
 <div className="px-4 py-3 border-b border-border bg-muted/50">
 <p className="text-sm font-semibold text-foreground">Admin User</p>
 <p className="text-xs font-medium text-muted-foreground truncate">
 {user?.email}
 </p>
 </div>
 <div className="p-2">
 <button
 onClick={() => {
 setIsProfileDropdownOpen(false);
 navigate('/admin/settings');
 }}
 className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-2"
 >
 <Settings01Icon className="w-4 h-4 text-muted-foreground"/> Account
 Settings
 </button>
 <div className="h-px bg-border my-1 mx-2"/>
 <button
 onClick={handleLogout}
 className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 font-medium rounded-md transition-colors flex items-center gap-2"
 >
 <Logout01Icon className="w-4 h-4 text-destructive"/> Sign out
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </header>

 {/* Page Content */}
 <main className="flex-1 p-6 sm:p-8 overflow-x-hidden relative">
 <GlobalLoader />
 <AnimatePresence mode="wait">
 <motion.div
 key={location.pathname}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 className="w-full max-w-7xl mx-auto"
 >
 <Outlet />
 </motion.div>
 </AnimatePresence>
 </main>
 </div>
 </div>
 );
};
