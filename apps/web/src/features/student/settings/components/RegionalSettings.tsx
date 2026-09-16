import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useSettings, useUpdateRegional } from '../hooks/useSettings';
import { SettingsSkeleton } from '@/components/common/Skeletons';

export default function RegionalSettings() {
  const { data, isLoading } = useSettings();
  const { mutate: updateRegional, isPending } = useUpdateRegional();

  const [formData, setFormData] = useState({
    language: 'en',
    timezone: 'Asia/Kolkata',
    timeFormat: '12-hour',
  });

  useEffect(() => {
    if (data?.preferences) {
      setFormData({
        language: data.preferences.language || 'en',
        timezone: data.preferences.timezone || 'Asia/Kolkata',
        timeFormat: data.preferences.timeFormat || '12-hour',
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRegional(formData);
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <Card className="p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl">
      <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4 mb-6">
        Language & Regional Settings
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 max-w-md">
          <label className="text-sm font-medium text-slate-700">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="en">English (US)</option>
            <option value="hi">Hindi</option>
            {/* Add more as needed */}
          </select>
        </div>

        <div className="space-y-2 max-w-md">
          <label className="text-sm font-medium text-slate-700">Timezone</label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="Asia/Kolkata">India Standard Time (IST)</option>
            <option value="UTC">Coordinated Universal Time (UTC)</option>
          </select>
        </div>

        <div className="space-y-2 max-w-md">
          <label className="text-sm font-medium text-slate-700">Time Format</label>
          <select
            value={formData.timeFormat}
            onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
            className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="12-hour">12-hour (1:00 PM)</option>
            <option value="24-hour">24-hour (13:00)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end max-w-md">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
