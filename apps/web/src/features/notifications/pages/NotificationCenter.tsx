import React from 'react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/hooks/queries/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { TickDouble02Icon, Delete01Icon, Megaphone01Icon, Calendar01Icon, Clock01Icon, FilterIcon, Search01Icon } from 'hugeicons-react';
import { PageHeader } from '@/components/ui/layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui';

export default function NotificationCenter() {
  const { data: notificationsResponse, isLoading } = useNotifications(50, 0);
  const notifications = notificationsResponse?.data || [];
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const [filter, setFilter] = React.useState('all'); // 'all', 'unread'
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNotifications = notifications.filter((n: any) => {
    if (filter === 'unread' && n.isRead) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Notifications"
        description="Stay updated with placement drives, interviews, and system alerts."
        actions={
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll || notifications.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 font-medium text-sm"
          >
            <TickDouble02Icon className="w-4 h-4 text-emerald-500" />
            Mark all as read
          </button>
        }
      />

      <Card className="mt-6 border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 sm:px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Unread
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <Megaphone01Icon className="w-12 h-12 mb-4 text-slate-200" />
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No notifications found</h3>
              <p className="text-slate-500 max-w-sm">
                You're all caught up! Check back later for updates on drives and interviews.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`p-5 flex gap-4 group transition-colors ${
                  !notification.isRead ? 'bg-blue-50/30 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  onClick={() => handleNotificationClick(notification)}
                  className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                    notification.type === 'placement_drive'
                      ? 'bg-blue-100 text-blue-600'
                      : notification.type === 'interview'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {notification.type === 'placement_drive' ? (
                    <Calendar01Icon className="w-5 h-5" />
                  ) : notification.type === 'interview' ? (
                    <Clock01Icon className="w-5 h-5" />
                  ) : (
                    <Megaphone01Icon className="w-5 h-5" />
                  )}
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <h4
                      className={`text-base ${!notification.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}
                    >
                      {notification.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{notification.message}</p>

                  {notification.priority === 'HIGH' && (
                    <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                      HIGH PRIORITY
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Notification"
                  >
                    <Delete01Icon className="w-4 h-4" />
                  </button>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Mark as Read"
                    >
                      <TickDouble02Icon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
