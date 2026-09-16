import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useSettings, useUpdateNotifications } from '../hooks/useSettings';
import { SettingsSkeleton } from '@/components/common/Skeletons';

export default function NotificationSettings() {
  const { data, isLoading } = useSettings();
  const { mutate: updateNotifs, isPending } = useUpdateNotifications();

  const [notifs, setNotifs] = useState<any>({});

  useEffect(() => {
    if (data?.notifications) {
      setNotifs(data.notifications);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setNotifs({ ...notifs, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotifs(notifs);
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <Card className="p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl">
      <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4 mb-6">
        Notification Preferences
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Delivery Channels</h4>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="emailEnabled"
              checked={notifs.emailEnabled || false}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-600">Email Notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="pushEnabled"
              checked={notifs.pushEnabled || false}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-600">Push Notifications</span>
          </label>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-medium text-slate-700">Notification Types</h4>
          {['placement', 'interviews', 'meetings', 'messages', 'assignments', 'system'].map(
            (type) => (
              <label key={type} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name={type}
                  checked={notifs[type] || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600 capitalize">{type} Alerts</span>
              </label>
            )
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl">
          <h4 className="font-medium text-slate-700">Quiet Hours</h4>
          <p className="text-sm text-slate-500 mb-2">Mute push notifications during these hours.</p>
          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              name="quietHoursEnabled"
              checked={notifs.quietHoursEnabled || false}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-slate-600">Enable Quiet Hours</span>
          </label>
          {notifs.quietHoursEnabled && (
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-slate-500">Start Time</label>
                <Input
                  type="time"
                  name="quietHoursStart"
                  value={notifs.quietHoursStart || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-slate-500">End Time</label>
                <Input
                  type="time"
                  name="quietHoursEnd"
                  value={notifs.quietHoursEnd || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
