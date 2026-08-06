import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead 
} from '@/hooks/queries/useNotifications';
import { useSocket } from '@/contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCircle2, Clock, Megaphone, CalendarDays, ExternalLink } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore();
  const { data: notificationsResponse, isLoading } = useNotifications(10, 0);
  const notifications = notificationsResponse?.data || [];
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
      socket.on('notification:update', handleUpdate);
      socket.on('notification:new', handleUpdate);
      return () => {
        socket.off('notification:update', handleUpdate);
        socket.off('notification:new', handleUpdate);
      };
    }
  }, [socket, queryClient]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
        <button 
          onClick={() => markAllAsRead()}
          disabled={isMarkingAll || notifications.length === 0}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
        >
          <CheckCircle2 className="w-3 h-3" />
          Mark all as read
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <Bell className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notification: any) => (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors flex gap-3 ${
                  !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  notification.type === 'placement_drive' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                  notification.type === 'interview' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {notification.type === 'placement_drive' ? <CalendarDays className="w-4 h-4" /> :
                   notification.type === 'interview' ? <Clock className="w-4 h-4" /> :
                   <Megaphone className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {notification.priority === 'HIGH' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-center">
        <Link 
          to={user?.role === 'STUDENT' ? '/student/notifications' : '/admin/notifications'}
          onClick={onClose}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-1 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}

// Re-importing Bell here just for the empty state
import { Bell } from 'lucide-react';
