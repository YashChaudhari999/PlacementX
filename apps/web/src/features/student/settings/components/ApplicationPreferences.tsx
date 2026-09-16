import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useSettings, useUpdatePreferences } from '../hooks/useSettings';
import { SettingsSkeleton } from '@/components/common/Skeletons';

export default function ApplicationPreferences() {
 const { data, isLoading } = useSettings();
 const { mutate: updatePrefs, isPending } = useUpdatePreferences();

 const [confirmBeforeApply, setConfirmBeforeApply] = useState(true);

 useEffect(() => {
 if (data?.preferences) {
 setConfirmBeforeApply(data.preferences.confirmBeforeApply ?? true);
 }
 }, [data]);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 updatePrefs({ confirmBeforeApply });
 };

 if (isLoading) return <SettingsSkeleton />;

 return (
 <Card className="p-6 border border-border/60 shadow-lg shadow-slate-200/40 bg-card/90 backdrop-blur-xl">
 <h3 className="font-bold text-foreground text-lg border-b border-border pb-4 mb-6">
 Application Preferences
 </h3>
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-2 max-w-md">
 <label className="flex items-center gap-3">
 <input
 type="checkbox"
 checked={confirmBeforeApply}
 onChange={(e) => setConfirmBeforeApply(e.target.checked)}
 className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
 />
 <span className="text-sm font-medium text-foreground">
 Confirm before applying to a drive
 </span>
 </label>
 <p className="text-xs text-muted-foreground ml-7">
 When enabled, you will be asked to confirm your action before submitting an application
 to a placement drive. This helps prevent accidental applications.
 </p>
 </div>

 <div className="pt-4 border-t border-border flex justify-end max-w-md">
 <Button type="submit"disabled={isPending}>
 {isPending ? 'Saving...' : 'Save Preferences'}
 </Button>
 </div>
 </form>
 </Card>
 );
}
