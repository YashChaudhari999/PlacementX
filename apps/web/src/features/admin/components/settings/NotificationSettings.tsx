import React from 'react';
import { Card, Button } from '@/components/ui';
import { Bell, Save } from 'lucide-react';


export default function NotificationSettings({ settings, getValue, handleChange, saveChanges, hasUnsavedChanges, saving }: any) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-800 text-lg">Communication Preferences</h3>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={() => saveChanges(['emailNotificationsEnabled', 'pushNotificationsEnabled'])} disabled={saving} size="sm">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <h4 className="text-sm font-medium text-slate-800">Email Notifications</h4>
            <p className="text-xs text-slate-500 mt-1">Allow system to send automated emails.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!getValue('emailNotificationsEnabled')}
              onChange={(e) => handleChange('emailNotificationsEnabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <h4 className="text-sm font-medium text-slate-800">Push Notifications</h4>
            <p className="text-xs text-slate-500 mt-1">Allow system to send in-app and browser push notifications.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!getValue('pushNotificationsEnabled')}
              onChange={(e) => handleChange('pushNotificationsEnabled', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </Card>
  );
}
