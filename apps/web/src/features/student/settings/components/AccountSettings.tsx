import { Card } from '@/components/ui';
import { useSettings } from '../hooks/useSettings';
import { SettingsSkeleton } from '@/components/common/Skeletons';

export default function AccountSettings() {
 const { data, isLoading, isError } = useSettings();

 if (isLoading) return <SettingsSkeleton />;
 if (isError || !data) return <div>Failed to load account settings</div>;

 const { account, profile } = data;

 return (
 <div className="space-y-6">
 <Card className="p-6 border border-border/60 shadow-lg shadow-slate-200/40 bg-card/90 backdrop-blur-xl">
 <h3 className="font-bold text-foreground text-lg border-b border-border pb-4 mb-6">
 Institutional Account Details
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="text-sm font-medium text-muted-foreground">Email Address</label>
 <p className="text-base font-semibold text-foreground mt-1">{account.email}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Student ID (Profile ID)</label>
 <p className="text-base font-semibold text-foreground mt-1">{profile.id}</p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Full Name</label>
 <p className="text-base font-semibold text-foreground mt-1">
 {profile.firstName} {profile.lastName}
 </p>
 </div>
 <div>
 <label className="text-sm font-medium text-muted-foreground">Branch</label>
 <p className="text-base font-semibold text-foreground mt-1">
 {profile.branch || 'Not Specified'}
 </p>
 </div>
 </div>

 <div className="mt-8 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
 <h4 className="text-sm font-semibold text-indigo-900">Note on Account Details</h4>
 <p className="text-sm text-indigo-700/80 mt-1 leading-relaxed">
 These details are provided by your institution and cannot be modified directly. If you
 need to change your name or branch, please submit a profile update request from your
 Profile page.
 </p>
 </div>
 </Card>
 </div>
 );
}
