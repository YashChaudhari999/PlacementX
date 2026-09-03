import React from 'react';
import { Card, Button, Input } from '@/components/ui';
import { Select } from '@/components/ui/selection';
import { GlobalIcon, FloppyDiskIcon } from 'hugeicons-react';

export default function GeneralSettings({
  settings,
  getValue,
  handleChange,
  saveChanges,
  hasUnsavedChanges,
  saving,
}: any) {
  // Dynamically generate academic year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    yearOptions.push({ label: `${i}/${i + 1}`, value: `${i}/${i + 1}` });
  }
  
  const currentAcademicYear = getValue('academicYear') || '';
  if (currentAcademicYear && !yearOptions.find((o) => o.value === currentAcademicYear)) {
    yearOptions.push({ label: currentAcademicYear, value: currentAcademicYear });
  }
  yearOptions.sort((a, b) => b.value.localeCompare(a.value)); // Newest first

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <GlobalIcon className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-800 text-lg">General Settings</h3>
        </div>
        {hasUnsavedChanges && (
          <Button
            onClick={() => saveChanges(['institutionName', 'supportEmail', 'academicYear'])}
            disabled={saving}
            size="sm"
          >
            <FloppyDiskIcon className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Institution Name</label>
          <Input
            value={getValue('institutionName') || ''}
            onChange={(e) => handleChange('institutionName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Support Email</label>
          <Input
            value={getValue('supportEmail') || ''}
            onChange={(e) => handleChange('supportEmail', e.target.value)}
          />
          <p className="text-xs text-slate-500">Visible to students in the support section.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Current Academic Year</label>
          <Select
            options={yearOptions}
            value={currentAcademicYear}
            onChange={(e) => handleChange('academicYear', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
