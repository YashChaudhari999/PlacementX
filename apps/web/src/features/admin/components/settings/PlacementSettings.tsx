import React from 'react';
import { Card, Button, Input } from '@/components/ui';
import { DatabaseIcon, FloppyDiskIcon } from 'hugeicons-react';

export default function PlacementSettings({
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
          <DatabaseIcon className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-800 text-lg">Placement Rules</h3>
        </div>
        {hasUnsavedChanges && (
          <Button
            onClick={() => saveChanges(['maxApplicationsPerStudent', 'allowMultipleOffers'])}
            disabled={saving}
            size="sm"
          >
            <FloppyDiskIcon className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Max Applications Per Student</label>
          <Input
            type="number"
            min={1}
            value={getValue('maxApplicationsPerStudent') || 4}
            onChange={(e) => handleChange('maxApplicationsPerStudent', parseInt(e.target.value))}
          />
          <p className="text-xs text-slate-500">
            The maximum number of ongoing/active applications a student can have at a time.
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <h4 className="text-sm font-medium text-slate-800">Allow Multiple Offers</h4>
            <p className="text-xs text-slate-500 mt-1">
              If enabled, students can accept more than one offer.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!getValue('allowMultipleOffers')}
              onChange={(e) => handleChange('allowMultipleOffers', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </Card>
  );
}
