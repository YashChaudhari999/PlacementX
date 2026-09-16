import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, EmptyState } from '@/components/ui';
import {
 Notification01Icon,
 Briefcase01Icon,
 Link02Icon,
 Tick01Icon,
 Sun01Icon,
 Moon01Icon,
 Calendar01Icon,
} from 'hugeicons-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications, useMarkNotificationRead } from '@/hooks/queries/useNotifications';
import { usePublishedDrives } from '@/hooks/queries/useDrives';
import { DashboardSkeleton } from '@/components/common/Skeletons';
import { motion } from 'framer-motion';

import { useStudentProfile } from '@/hooks/queries/useStudent';

export default function StudentDashboard() {
 const user = useAuthStore((state) => state.user);
 const [greeting, setGreeting] = useState('');
 const navigate = useNavigate();
 const { data: notificationsResponse, isPending: notificationsLoading } = useNotifications();
 const notifications = notificationsResponse?.data || [];
 const { data: drives = [], isPending: drivesLoading } = usePublishedDrives();
 const markAsReadMutation = useMarkNotificationRead();
 const { data: profileData } = useStudentProfile(user?.id);

 const studentName = profileData?.firstName
 ? `${profileData.firstName} ${profileData.lastName || ''}`.trim()
 : user?.firstName
 ? `${user.firstName} ${user.lastName || ''}`.trim()
 : user?.email?.split('@')[0] || 'Student';

 useEffect(() => {
 const hour = new Date().getHours();

 if (hour < 12) setGreeting('Good morning');
 else if (hour < 18) setGreeting('Good afternoon');
 else setGreeting('Good evening');
 }, []);

 const markAsRead = (id: string) => {
 markAsReadMutation.mutate(id);
 };

 if (notificationsLoading || drivesLoading) return <DashboardSkeleton />;

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.1 },
 },
 };

 const itemVariants = {
 hidden: { opacity: 0, y: 10 },
 visible: { opacity: 1, y: 0 },
 };

 return (
 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className="space-y-8 pb-20"
 >
 {/* Hero Welcome Section */}
 <motion.div
 variants={itemVariants}
 className="bg-card border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden"
 >
 <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
 <Briefcase01Icon className="w-64 h-64"/>
 </div>
 <div className="relative z-10 flex flex-col justify-center max-w-2xl">
 <div className="flex items-center gap-2 mb-3">
 {greeting.includes('morning') ? (
 <Sun01Icon className="text-warning w-5 h-5"/>
 ) : (
 <Moon01Icon className="text-primary w-5 h-5"/>
 )}
 <span className="text-muted-foreground font-semibold tracking-wide uppercase text-xs">
 {greeting}
 </span>
 </div>
 <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
 Welcome back, {studentName}
 </h1>
 <p className="text-muted-foreground text-base sm:text-lg">
 You have{' '}
 <strong className="text-foreground">{drives.length} active placement drives</strong>{' '}
 available. Review and apply to maximize your chances.
 </p>
 </div>
 </motion.div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Main Content: Active Drives */}
 <div className="lg:col-span-2 space-y-4">
 <motion.div
 variants={itemVariants}
 className="flex items-center justify-between pb-2 border-b border-border"
 >
 <h2 className="text-xl font-bold text-foreground">Active Drives</h2>
 <Button variant="ghost"size="sm"onClick={() => navigate('/student/drives')}>
 View All
 </Button>
 </motion.div>

 <div className="space-y-4 pt-2">
 {drives.length === 0 ? (
 <motion.div variants={itemVariants}>
 <EmptyState
 icon={<Briefcase01Icon className="w-12 h-12"/>}
 title="No active drives"
 description="There are no placement drives actively recruiting at the moment."
 />
 </motion.div>
 ) : (
 drives.map((drive: any, idx: number) => (
 <motion.div key={drive.id} variants={itemVariants} custom={idx}>
 <Card
 variant="interactive"
 padding="md"
 className="group border-border hover:border-primary/50 overflow-hidden relative"
 >
 <div className="absolute inset-y-0 left-0 w-1 bg-primary transform origin-left scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out"/>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-2">
 <h3 className="font-bold text-lg text-foreground truncate">
 {drive.company.name}
 </h3>
 {idx === 0 && (
 <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded">
 Recommended
 </span>
 )}
 <span className="px-2.5 py-0.5 bg-success-muted text-success text-xs font-bold rounded">
 {drive.fixedSalary ? `${drive.fixedSalary} LPA` : 'TBD'}
 </span>
 </div>
 <p className="text-muted-foreground font-medium text-sm mb-4 truncate">
 {drive.jobRole}
 </p>

 <div className="flex flex-wrap gap-3 text-xs font-medium">
 <div className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2.5 py-1 rounded">
 <Briefcase01Icon className="w-3.5 h-3.5"/>
 {drive.employmentType}
 </div>
 {drive.registrationStart &&
 new Date(drive.registrationStart) > new Date() ? (
 <div className="flex items-center gap-1.5 bg-info-muted text-info px-2.5 py-1 rounded">
 <Calendar01Icon className="w-3.5 h-3.5"/>
 Starts: {new Date(drive.registrationStart).toLocaleDateString()}
 </div>
 ) : (
 <div className="flex items-center gap-1.5 bg-warning-muted text-warning px-2.5 py-1 rounded">
 <Notification01Icon className="w-3.5 h-3.5"/>
 Deadline:{' '}
 {drive.registrationEnd
 ? new Date(drive.registrationEnd).toLocaleDateString()
 : 'TBD'}
 </div>
 )}
 </div>
 </div>

 <div className="flex-shrink-0 mt-2 sm:mt-0">
 <Button
 variant="outline"
 onClick={() => navigate(`/student/drives/${drive.id}`)}
 className="w-full sm:w-auto"
 >
 View Details
 </Button>
 </div>
 </div>
 </Card>
 </motion.div>
 ))
 )}
 </div>
 </div>

 {/* Sidebar: Notifications */}
 <div className="space-y-4">
 <motion.div variants={itemVariants} className="sticky top-24 space-y-4">
 <div className="flex items-center justify-between pb-2 border-b border-border">
 <h2 className="text-xl font-bold text-foreground">Notifications</h2>
 {notifications.filter((n: any) => !n.isRead).length > 0 && (
 <span className="bg-destructive text-destructive-foreground text-[10px] uppercase px-2 py-0.5 rounded font-bold">
 {notifications.filter((n: any) => !n.isRead).length} New
 </span>
 )}
 </div>

 <Card padding="none"className="overflow-hidden border-border bg-card">
 <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto scrollbar-hide">
 {notifications.length === 0 ? (
 <div className="p-8 text-center flex flex-col items-center justify-center opacity-70">
 <Notification01Icon className="w-8 h-8 text-muted-foreground mb-3"/>
 <p className="text-sm font-medium text-muted-foreground">
 You're all caught up!
 </p>
 </div>
 ) : (
 notifications.map((notification: any) => (
 <div
 key={notification.id}
 className={`relative p-3 rounded-lg transition-colors border-l-2 ${
 notification.isRead
 ? 'border-transparent hover:bg-muted/50'
 : 'border-primary bg-primary/5'
 }`}
 >
 <div className="flex justify-between items-start mb-1">
 <h4
 className={`text-sm font-semibold ${notification.isRead ? 'text-foreground' : 'text-primary'}`}
 >
 {notification.title}
 </h4>
 {!notification.isRead && (
 <button
 onClick={() => markAsRead(notification.id)}
 className="text-primary hover:text-primary/80 p-1"
 title="Mark as read"
 >
 <Tick01Icon className="w-4 h-4"/>
 </button>
 )}
 </div>

 <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
 {notification.message}
 </p>

 <div className="flex justify-between items-center pt-2">
 <span className="text-[10px] font-medium text-muted-foreground">
 {new Date(notification.createdAt).toLocaleDateString()}
 </span>
 {notification.link && (
 <Button variant="link"size="sm"className="h-auto p-0 text-[10px]">
 Details <Link02Icon className="w-3 h-3 ml-1"/>
 </Button>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </Card>
 </motion.div>
 </div>
 </div>
 </motion.div>
 );
}
