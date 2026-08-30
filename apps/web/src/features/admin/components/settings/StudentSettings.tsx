import React from 'react';
import { Card, Button, Input } from '@/components/ui';
import { Mortarboard01Icon, FloppyDiskIcon } from 'hugeicons-react';

export default function StudentSettings({
  settings,
  getValue,
  handleChange,
  saveChanges,
  hasUnsavedChanges,
  saving,
}: any) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Mortarboard01Icon className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-800 text-lg">Student Configurations</h3>
        </div>
        {hasUnsavedChanges && (
          <Button
            onClick={() =>
              saveChanges(['requireProfileVerification', 'minimumCGPA', 'maxBacklogsAllowed'])
            }
            disabled={saving}
            size="sm"
          >
            <FloppyDiskIcon className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <h4 className="text-sm font-medium text-slate-800">Require Profile Verification</h4>
            <p className="text-xs text-slate-500 mt-1">
              Students must have their profile verified by an admin before applying.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!getValue('requireProfileVerification')}
              onChange={(e) => handleChange('requireProfileVerification', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Default Minimum CGPA (System-wide)
          </label>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={10}
            value={getValue('minimumCGPA') || 0}
            onChange={(e) => handleChange('minimumCGPA', parseFloat(e.target.value))}
          />
          <p className="text-xs text-slate-500">
            Fallback minimum CGPA required if a drive doesn't specify one.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Default Max Active Backlogs</label>
          <Input
            type="number"
            min={0}
            value={getValue('maxBacklogsAllowed') || 0}
            onChange={(e) => handleChange('maxBacklogsAllowed', parseInt(e.target.value))}
          />
        </div>
      </div>
    </Card>
  );
}
