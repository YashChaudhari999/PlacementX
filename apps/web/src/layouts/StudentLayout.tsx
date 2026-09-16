import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/authService';
import {
 DashboardSquare01Icon,
 Briefcase01Icon,
 Note01Icon,
 Notification01Icon,
 Calendar01Icon,
 Settings01Icon,
 Logout01Icon,
 Menu01Icon,
 UserIcon,
 Award01Icon,
 ArrowDown01Icon,
 Camera01Icon,
 Download01Icon,
} from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useFCMToken } from '@/hooks/useFCMToken';
import { useStudentProfile, useUpdateStudentPhoto } from '@/hooks/queries/useStudent';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { GlobalLoader } from '@/components/ui/feedback';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';

export const StudentLayout = () => {
 const { user } = useAuthStore();
 const navigate = useNavigate();
 const location = useLocation();
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
 const { unreadCount } = useNotifications();
 const { data: serverProfile } = useStudentProfile(user?.id);
 const updatePhotoMutation = useUpdateStudentPhoto();

 // Register for FCM tokens
 useFCMToken(user);

 let completionPercentage = 0;
 if (serverProfile) {
 const requiredFields = ['firstName', 'lastName', 'phone', 'branch', 'cgpa', 'passingYear'];
 let filled = 0;
 requiredFields.forEach((field) => {
 if (serverProfile[field as keyof typeof serverProfile]) filled++;
 });
 if (serverProfile.resumeUrl) filled += 1;
 if (serverProfile.githubUrl) filled += 0.5;
 if (serverProfile.portfolioUrl) filled += 0.5;
 completionPercentage = Math.min(Math.round((filled / 8) * 100), 100);
 }

 const handleLogout = async () => {
 await authService.logout();
 navigate('/student/login');
 };

 const navGroups = [
 {
 title: 'Menu',
 items: [
 { name: 'Dashboard', href: '/student/dashboard', icon: DashboardSquare01Icon },
 { name: 'My Profile', href: '/student/profile', icon: UserIcon },
 { name: 'Applications', href: '/student/applications', icon: Briefcase01Icon },
 { name: 'Rounds', href: '/student/interviews', icon: Award01Icon },
 { name: 'Calendar', href: '/student/calendar', icon: Calendar01Icon },
 { name: 'Documents', href: '/student/documents', icon: Note01Icon },
 ],
 },
 {
 title: 'Updates',
 items: [
 {
 name: 'Notifications',
 href: '/student/notifications',
 icon: Notification01Icon,
 badge: unreadCount,
 },
 { name: 'Settings', href: '/student/settings', icon: Settings01Icon },
 ],
 },
 ];

 const pageTitle =
 navGroups.flatMap((g) => g.items).find((item) => location.pathname.startsWith(item.href))
 ?.name || 'Dashboard';

 const sidebarLogo = (
 <button
 onClick={() => navigate('/student/dashboard')}
 className="flex items-center gap-2 transition-opacity hover:opacity-80 mx-auto lg:mx-0"
 >
 <img
 src="/nmimslogo_transparent.png"
 alt="NMIMS Logo"
 className="dark:brightness-0 dark:invert h-10 w-auto object-contain"
 />
 <span className="font-extrabold text-lg text-primary tracking-tight hidden lg:block">
 PlacementX
 </span>
 </button>
 );

 const sidebarFooter = (
 <div className="flex flex-col gap-4">
 <div className="bg-muted rounded-xl p-3 shadow-sm border border-border">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <Award01Icon className="h-4 w-4 text-warning animate-pulse"/>
 <span className="text-xs font-bold text-foreground">Profile Strength</span>
 </div>
 <span className="text-xs font-black text-success">{completionPercentage}%</span>
 </div>
 <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${completionPercentage}%` }}
 transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
 className="bg-success h-1.5 rounded-full"
 />
 </div>
 </div>
 <Button
 variant="outline"
 onClick={handleLogout}
 className="w-full gap-2 text-destructive hover:bg-destructive/10 border-border"
 >
 <Logout01Icon className="h-4 w-4"/>
 Log Out
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
 <div className="flex-1 flex flex-col lg:pl-[280px] min-w-0 relative z-10">
 {/* Dynamic Header */}
 <header className="h-16 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setIsMobileMenuOpen(true)}
 className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
 >
 <Menu01Icon className="h-5 w-5"/>
 </button>
 <h1 className="text-xl font-bold text-foreground hidden sm:block tracking-tight">
 {pageTitle}
 </h1>
 </div>

 <div className="flex items-center gap-4 sm:gap-6">
 <a
 href="/placementx-student-app.apk"
 download="PlacementX_Student.apk"
 className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
 >
 <Download01Icon className="h-3.5 w-3.5"/>
 <span>Mobile App</span>
 </a>

 <NotificationBell />

 <div className="relative">
 <button
 onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
 className="flex items-center gap-2 hover:bg-muted p-1 pr-2 rounded-full transition-colors"
 >
 <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
 <img
 src={
 serverProfile?.photoUrl ||
 `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}&backgroundColor=f1f5f9`
 }
 alt="avatar"
 className="h-full w-full object-cover"
 />
 </div>
 <ArrowDown01Icon className="h-4 w-4 text-muted-foreground hidden sm:block"/>
 </button>

 <AnimatePresence>
 {isProfileDropdownOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 mt-2 w-64 rounded-xl shadow-dropdown bg-popover border border-border overflow-hidden"
 >
 <div className="p-4 border-b border-border bg-muted/30 text-center">
 <div className="h-16 w-16 mx-auto rounded-full bg-secondary mb-3 overflow-hidden shadow-sm relative group border border-border">
 <img
 src={
 serverProfile?.photoUrl ||
 `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}&backgroundColor=f1f5f9`
 }
 alt="avatar"
 className="h-full w-full object-cover"
 />
 <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
 <Camera01Icon className="w-5 h-5 mb-0.5"/>
 <span className="text-[9px] font-bold uppercase tracking-wider">
 Change
 </span>
 <input
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file && user) {
 const reader = new FileReader();
 reader.onloadend = () => {
 updatePhotoMutation.mutate({
 userId: user.id,
 photoUrl: reader.result as string,
 });
 };
 reader.readAsDataURL(file);
 }
 }}
 />
 </label>
 </div>
 <p className="text-sm font-bold text-foreground">
 {serverProfile?.firstName
 ? `${serverProfile.firstName} ${serverProfile.lastName || ''}`.trim()
 : user?.email?.split('@')[0]}
 </p>
 <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
 {user?.email}
 </p>
 </div>
 <div className="p-2">
 <button
 onClick={() => {
 setIsProfileDropdownOpen(false);
 navigate('/student/profile');
 }}
 className="w-full text-left px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-3"
 >
 <UserIcon className="w-4 h-4 text-muted-foreground"/> View Profile
 </button>
 <button
 onClick={() => {
 setIsProfileDropdownOpen(false);
 navigate('/student/settings');
 }}
 className="w-full text-left px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-3"
 >
 <Settings01Icon className="w-4 h-4 text-muted-foreground"/> Preferences
 </button>
 <div className="h-px bg-border my-1 mx-1"/>
 <button
 onClick={handleLogout}
 className="w-full text-left px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors flex items-center gap-3"
 >
 <Logout01Icon className="w-4 h-4"/> Sign out
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </header>

 {/* Page Content */}
 <main className="flex-1 p-6 sm:p-8 relative">
 <GlobalLoader />
 <AnimatePresence mode="wait">
 <motion.div
 key={location.pathname}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 className="w-full max-w-6xl mx-auto"
 >
 <Outlet />
 </motion.div>
 </AnimatePresence>
 </main>
 </div>
 </div>
 );
};
