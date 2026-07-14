import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Bell, Briefcase, ExternalLink, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications, useMarkNotificationRead } from '@/hooks/queries/useNotifications';
import { usePublishedDrives } from '@/hooks/queries/useDrives';
import { DashboardSkeleton } from '@/components/common/Skeletons';

export default function StudentDashboard() {
  const user = useAuthStore(state => state.user);
  
  const { data: notifications = [], isPending: notificationsLoading } = useNotifications(user?.id);
  const { data: drives = [], isPending: drivesLoading } = usePublishedDrives();
  const markAsReadMutation = useMarkNotificationRead();

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  if (notificationsLoading || drivesLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.email}</h1>
        <p className="text-slate-500 mt-1">Here is your placement dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary" />
              Active Drives
            </h2>
            
            <div className="space-y-4">
              {drives.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No active drives available right now.
                </div>
              ) : (
                drives.map((drive: any) => (
                  <div key={drive.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{drive.company.name}</h3>
                        <p className="text-slate-600 font-medium">{drive.jobRole}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        {drive.fixedSalary ? `${drive.fixedSalary} LPA` : 'TBD'}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex gap-4 text-sm text-slate-500">
                      <div><span className="font-semibold text-slate-700">Type:</span> {drive.employmentType}</div>
                      <div><span className="font-semibold text-slate-700">Deadline:</span> {new Date(drive.registrationEnd).toLocaleDateString()}</div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => window.location.href = `/student/drives/${drive.id}`}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              Notifications
              {notifications.filter((n: any) => !n.isRead).length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {notifications.filter((n: any) => !n.isRead).length} New
                </span>
              )}
            </h2>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">You have no notifications.</p>
              ) : (
                notifications.map((notification: any) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${notification.isRead ? 'bg-slate-50 border-slate-100' : 'bg-blue-50/50 border-blue-100'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-slate-700' : 'text-blue-900'}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <button onClick={() => markAsRead(notification.id)} className="text-blue-500 hover:text-blue-700" title="Mark as read">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">{notification.message}</p>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {notification.link && (
                        <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 py-0">
                          View Details <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
