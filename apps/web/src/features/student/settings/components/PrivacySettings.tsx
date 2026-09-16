import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useSettings, useUpdatePrivacy } from '../hooks/useSettings';
import { SettingsSkeleton } from '@/components/common/Skeletons';

export default function PrivacySettings() {
 const { data, isLoading } = useSettings();
 const { mutate: updatePrivacy, isPending } = useUpdatePrivacy();

 const [formData, setFormData] = useState({
 profileVisibility: 'PUBLIC',
 resumeVisibility: 'RECRUITER_ONLY',
 });

 useEffect(() => {
 if (data?.preferences) {
 setFormData({
 profileVisibility: data.preferences.profileVisibility || 'PUBLIC',
 resumeVisibility: data.preferences.resumeVisibility || 'RECRUITER_ONLY',
 });
 }
 }, [data]);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 updatePrivacy(formData);
 };

 if (isLoading) return <SettingsSkeleton />;

 return (
 <Card className="p-6 border border-border/60 shadow-lg shadow-slate-200/40 bg-card/90 backdrop-blur-xl">
 <h3 className="font-bold text-foreground text-lg border-b border-border pb-4 mb-6">
 Privacy Settings
 </h3>
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-2 max-w-md">
 <label className="text-sm font-medium text-foreground">Profile Visibility</label>
 <p className="text-xs text-muted-foreground mb-2">
 Control who can view your basic profile details.
 </p>
 <select
 value={formData.profileVisibility}
 onChange={(e) => setFormData({ ...formData, profileVisibility: e.target.value })}
 className="w-full h-10 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
 >
 <option value="PUBLIC">Public (Visible to everyone)</option>
 <option value="RECRUITER_ONLY">Recruiters & Admins Only</option>
 <option value="PRIVATE">Private (Only Admins)</option>
 </select>
 </div>

 <div className="space-y-2 max-w-md">
 <label className="text-sm font-medium text-foreground">Resume Visibility</label>
 <p className="text-xs text-muted-foreground mb-2">
 Control who can download your default resume.
 </p>
 <select
 value={formData.resumeVisibility}
 onChange={(e) => setFormData({ ...formData, resumeVisibility: e.target.value })}
 className="w-full h-10 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
 >
 <option value="PUBLIC">Public (Visible to everyone)</option>
 <option value="RECRUITER_ONLY">Recruiters & Admins Only</option>
 <option value="PRIVATE">Private (Only Admins)</option>
 </select>
 </div>

 <div className="pt-4 border-t border-border flex justify-end max-w-md">
 <Button type="submit"disabled={isPending}>
 {isPending ? 'Saving...' : 'Save Privacy Settings'}
 </Button>
 </div>
 </form>
 </Card>
 );
}
