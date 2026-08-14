import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Bell, Briefcase, ExternalLink, Check, Sun, Moon, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications, useMarkNotificationRead } from '@/hooks/queries/useNotifications';
import { usePublishedDrives } from '@/hooks/queries/useDrives';
import { DashboardSkeleton } from '@/components/common/Skeletons';
import { motion } from 'framer-motion';

import StudentInsightsPanel from '../components/StudentInsightsPanel';
import { useStudentProfile, useStudentMLPrediction } from '@/hooks/queries/useStudent';

export default function StudentDashboard() {
  const user = useAuthStore(state => state.user);
  const [greeting, setGreeting] = useState('');
  
  const { data: notificationsResponse, isPending: notificationsLoading } = useNotifications();
  const notifications = notificationsResponse?.data || [];
  const { data: drives = [], isPending: drivesLoading } = usePublishedDrives();
  const markAsReadMutation = useMarkNotificationRead();
  const { data: profileData } = useStudentProfile(user?.id);
  const { data: mlPrediction } = useStudentMLPrediction(user?.id, profileData);

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
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="space-y-8 max-w-5xl mx-auto p-4 md:p-6 pb-20"
    >
      {/* Hero Welcome Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Briefcase className="w-64 h-64 transform rotate-12 translate-x-16 -translate-y-16" />
        </div>
        <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center min-h-[200px] backdrop-blur-sm bg-black/10">
          <div className="flex items-center gap-3 mb-2">
            {greeting.includes('morning') ? <Sun className="text-yellow-300 w-6 h-6" /> : <Moon className="text-blue-200 w-6 h-6" />}
            <span className="text-blue-100 font-medium tracking-wide uppercase text-sm">{greeting}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Student'}!
          </h1>
          <p className="text-blue-100 max-w-lg text-lg">
            Stay on top of your placement journey. You have <strong className="text-white">{drives.length} active drives</strong> available right now.
          </p>
        </div>
      </motion.div>

      <StudentInsightsPanel prediction={mlPrediction} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Active Drives */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              Active Drives
            </h2>
          </motion.div>

          <div className="space-y-4">
            {drives.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card className="p-12 text-center border-dashed border-2 bg-slate-50/50 backdrop-blur-md">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700">No active drives</h3>
                  <p className="text-slate-500 mt-1">There are no placement drives actively recruiting at the moment.</p>
                </Card>
              </motion.div>
            ) : (
              drives.map((drive: any, idx: number) => (
                <motion.div key={drive.id} variants={itemVariants} custom={idx}>
                  <Card className="group p-6 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-md overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 transform origin-left scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-xl text-slate-900">{drive.company.name}</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm">
                            {drive.fixedSalary ? `${drive.fixedSalary} LPA` : 'TBD'}
                          </span>
                        </div>
                        <p className="text-blue-600 font-semibold mb-4">{drive.jobRole}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            {drive.employmentType}
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-md text-red-600 font-medium bg-red-50">
                            <Bell className="w-4 h-4" />
                            Deadline: {new Date(drive.registrationEnd).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full sm:w-auto flex-shrink-0 mt-4 sm:mt-0">
                        <Button className="w-full sm:w-auto bg-slate-900 hover:bg-blue-600 transition-colors shadow-md" onClick={() => window.location.href = `/student/drives/${drive.id}`}>
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
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="sticky top-24">
            <h2 className="text-xl font-bold text-slate-800 flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Notifications
              </div>
              {notifications.filter((n: any) => !n.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm shadow-red-500/30 animate-pulse">
                  {notifications.filter((n: any) => !n.isRead).length} New
                </span>
              )}
            </h2>
            
            <Card className="bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center opacity-70">
                    <Bell className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification: any, idx: number) => (
                    <motion.div 
                      key={notification.id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`relative p-4 rounded-xl transition-all duration-200 ${notification.isRead ? 'bg-transparent hover:bg-slate-50' : 'bg-blue-50/50 shadow-sm shadow-blue-900/5'}`}
                    >
                      {!notification.isRead && (
                        <div className="absolute top-4 left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
                      )}
                      
                      <div className="flex justify-between items-start mb-1 pl-2">
                        <h4 className={`text-sm font-bold ${notification.isRead ? 'text-slate-700' : 'text-blue-900'}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <button onClick={() => markAsRead(notification.id)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1 rounded-md transition-colors" title="Mark as read">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-600 mb-3 pl-2 line-clamp-2 leading-relaxed">{notification.message}</p>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 pl-2">
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {notification.link && (
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 py-0 hover:bg-slate-100 text-blue-600">
                            Details <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
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
