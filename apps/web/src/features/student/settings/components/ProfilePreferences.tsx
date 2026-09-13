import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useSettings, useUpdatePreferences } from '../hooks/useSettings';
import { Loading } from '@/components/common/Loading';

export default function ProfilePreferences() {
  const { data, isLoading } = useSettings();
  const { mutate: updatePrefs, isPending } = useUpdatePreferences();

  const [formData, setFormData] = useState({
    jobCategories: '',
    industries: '',
    locations: '',
    workMode: '',
    salaryRange: ''
  });

  useEffect(() => {
    if (data?.preferences) {
      setFormData({
        jobCategories: Array.isArray(data.preferences.jobCategories) ? data.preferences.jobCategories.join(', ') : '',
        industries: Array.isArray(data.preferences.industries) ? data.preferences.industries.join(', ') : '',
        locations: Array.isArray(data.preferences.locations) ? data.preferences.locations.join(', ') : '',
        workMode: Array.isArray(data.preferences.workMode) ? data.preferences.workMode.join(', ') : '',
        salaryRange: data.preferences.salaryRange || ''
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrefs({
      jobCategories: formData.jobCategories.split(',').map(s => s.trim()).filter(Boolean),
      industries: formData.industries.split(',').map(s => s.trim()).filter(Boolean),
      locations: formData.locations.split(',').map(s => s.trim()).filter(Boolean),
      workMode: formData.workMode.split(',').map(s => s.trim()).filter(Boolean),
      salaryRange: formData.salaryRange
    });
  };

  if (isLoading) return <Loading />;

  return (
    <Card className="p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl">
      <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4 mb-6">
        Placement & Job Preferences
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Preferred Job Categories (comma separated)</label>
          <Input 
            value={formData.jobCategories}
            onChange={(e) => setFormData({...formData, jobCategories: e.target.value})}
            placeholder="e.g. Software Engineer, Data Scientist"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Target Industries (comma separated)</label>
          <Input 
            value={formData.industries}
            onChange={(e) => setFormData({...formData, industries: e.target.value})}
            placeholder="e.g. Technology, Finance"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Preferred Locations (comma separated)</label>
          <Input 
            value={formData.locations}
            onChange={(e) => setFormData({...formData, locations: e.target.value})}
            placeholder="e.g. Bangalore, Hyderabad, Remote"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Work Mode (comma separated)</label>
            <Input 
              value={formData.workMode}
              onChange={(e) => setFormData({...formData, workMode: e.target.value})}
              placeholder="e.g. Remote, Hybrid, On-site"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Expected Salary Range (LPA)</label>
            <Input 
              value={formData.salaryRange}
              onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
              placeholder="e.g. 10 - 15 LPA"
            />
          </div>
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
