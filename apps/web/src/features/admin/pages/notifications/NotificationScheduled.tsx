import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useScheduledNotifications } from '@/hooks/queries/useAdminNotifications';
import { CalendarDays, Users, Edit, Trash2, Smartphone, Bell, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationScheduled() {
  const { data: res, isLoading, refetch } = useScheduledNotifications({});
  const scheduled = res?.data || [];

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled notification?')) {
      toast.success('Scheduled notification cancelled.');
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            Upcoming Notifications
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Notification
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Audience
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Channels
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Scheduled For (IST)
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading scheduled items...
                  </td>
                </tr>
              ) : scheduled.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-16 text-center text-slate-500 flex flex-col items-center justify-center"
                  >
                    <CalendarDays className="w-10 h-10 mb-3 text-slate-300" />
                    <h4 className="text-base font-semibold text-slate-700">
                      No scheduled notifications
                    </h4>
                    <p className="text-sm mt-1">Schedule a notification to see it here.</p>
                  </td>
                </tr>
              ) : (
                scheduled.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">{item.type}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-700">{item.audienceDesc}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        {item.recipientCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {item.channels.includes('Push') && (
                          <span title="Push">
                            <Smartphone className="w-4 h-4 text-slate-400" />
                          </span>
                        )}
                        {item.channels.includes('In-App') && (
                          <span title="In-App">
                            <Bell className="w-4 h-4 text-slate-400" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {new Date(item.scheduledFor).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-amber-600 font-semibold">
                            {new Date(item.scheduledFor).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit Schedule"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Cancel Notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
