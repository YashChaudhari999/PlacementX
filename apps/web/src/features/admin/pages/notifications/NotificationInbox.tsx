import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { Bell, Check, Clock } from 'lucide-react';
import { useNotifications, useMarkAsRead } from '@/hooks/queries/useNotifications';

export default function NotificationInbox() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const { data, isLoading, isError } = useNotifications(limit, offset);
  const { mutate: markAsRead } = useMarkAsRead();

  const notifications = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          Admin Inbox
        </h3>
      </div>
      
      <div className="divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading your notifications...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Failed to load notifications.</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No notifications found.</div>
        ) : (
          notifications.map((notification: any) => (
            <div 
              key={notification.id} 
              className={`p-4 flex gap-4 transition-colors ${notification.isRead ? 'bg-white' : 'bg-indigo-50/20'}`}
            >
              <div className="shrink-0 mt-1">
                <div className={`w-2 h-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-indigo-600'}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 text-sm">{notification.title}</h4>
                <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  <span className="uppercase tracking-wider">{notification.category}</span>
                </div>
              </div>
              <div className="shrink-0">
                {!notification.isRead && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </Card>
  );
}
