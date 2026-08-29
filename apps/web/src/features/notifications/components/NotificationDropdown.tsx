import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/hooks/queries/useNotifications';
import { useSocket } from '@/contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Clock, Megaphone, CalendarDays, ExternalLink, Bell } from 'lucide-react';
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
    <div className="flex flex-col max-h-[85vh] bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-10">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Notifications
        </h3>
        <button
          onClick={() => markAllAsRead()}
          disabled={isMarkingAll || notifications.length === 0}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-5 space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                <div className="space-y-3 flex-1 pt-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center h-48">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No new notifications
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative p-4 px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-4 ${
                  !notification.isRead ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''
                }`}
              >
                {/* Unread indicator bar */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                {/* Icon */}
                <div
                  className={`mt-0.5 w-10 h-10 rounded-full ring-1 ring-inset flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                    notification.type === 'placement_drive'
                      ? 'bg-blue-50 text-blue-600 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20'
                      : notification.type === 'interview'
                        ? 'bg-purple-50 text-purple-600 ring-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20'
                        : 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
                  }`}
                >
                  {notification.type === 'placement_drive' ? (
                    <CalendarDays className="w-4 h-4" />
                  ) : notification.type === 'interview' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Megaphone className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !notification.isRead
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>

                  {/* Footer & Badges */}
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {notification.priority === 'HIGH' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 text-center">
        <Link
          to={user?.role === 'STUDENT' ? '/student/notifications' : '/admin/notifications'}
          onClick={onClose}
          className="text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white py-2.5 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 w-full ring-1 ring-inset ring-slate-200 dark:ring-slate-700/50"
        >
          View all notifications
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
