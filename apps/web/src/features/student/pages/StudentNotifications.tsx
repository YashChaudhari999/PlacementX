import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { Card, Button } from '@/components/ui';
import { toast } from 'sonner';
import { Bell, Check, ExternalLink, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useNotifications, useMarkNotificationRead } from '@/hooks/queries/useNotifications';
import { ListSkeleton } from '@/components/common/Skeletons';

export default function StudentNotifications() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  
  const { data: notifications = [], isPending } = useNotifications(user?.id);
  const markAsReadMutation = useMarkNotificationRead();

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  if (isPending) return <ListSkeleton />;

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = activeTab === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ALERT': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'WARNING': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgForType = (type: string, isRead: boolean) => {
    if (isRead) return 'hover:bg-slate-50';
    switch (type) {
      case 'ALERT': return 'bg-red-50/50 border-l-4 border-red-500';
      case 'SUCCESS': return 'bg-emerald-50/50 border-l-4 border-emerald-500';
      case 'WARNING': return 'bg-amber-50/50 border-l-4 border-amber-500';
      default: return 'bg-blue-50/50 border-l-4 border-blue-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500">Stay updated on drives, interviews, and offers.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAsRead('all')}>
            <Check className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="flex border-b border-slate-100 px-2 pt-2">
          <button 
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('all')}
          >
            All Updates
          </button>
          <button 
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'unread' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread {unreadCount > 0 && <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">You're all caught up!</p>
            <p className="text-sm mt-1">No new notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 flex gap-4 transition-colors ${getBgForType(notif.type, notif.isRead)} ${notif.isRead ? 'border-l-4 border-transparent' : ''}`}
              >
                <div className="mt-1 shrink-0 p-2 bg-white rounded-full shadow-sm border border-slate-100">
                  {getIconForType(notif.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${!notif.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-4">
                    {notif.link && (
                      <Link to={notif.link} className="text-xs font-semibold px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-1.5">
                        View Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {!notif.isRead && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
