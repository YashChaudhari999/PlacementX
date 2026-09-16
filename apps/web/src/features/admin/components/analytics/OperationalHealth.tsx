import { Card } from '@/components/ui';
import { Activity01Icon, Clock01Icon, Note01Icon, Calendar01Icon } from 'hugeicons-react';
import type { OperationalHealth as OperationalHealthType } from '@/types/analytics.types';
import { format } from 'date-fns';

export default function OperationalHealth({ data }: { data: OperationalHealthType }) {
 if (!data) return null;

 return (
 <Card className="p-6 border-border">
 <div className="flex items-center gap-2 mb-6">
 <div className="p-2 bg-muted rounded-xl text-muted-foreground">
 <Activity01Icon className="w-5 h-5"/>
 </div>
 <div>
 <h2 className="text-lg font-bold text-foreground">Operational Health</h2>
 <p className="text-xs text-muted-foreground">System and workflow status</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3 mb-6">
 <div className="p-3.5 bg-warning-muted rounded-xl border border-amber-100 flex flex-col justify-between">
 <div className="flex items-start justify-between mb-2 gap-2">
 <div className="text-[10px] sm:text-xs font-bold text-warning uppercase tracking-wider leading-tight">
 Pending Profiles
 </div>
 <Note01Icon className="w-4 h-4 text-amber-400 shrink-0"/>
 </div>
 <div className="text-2xl font-black text-amber-900">{data.pendingVerifications}</div>
 </div>

 <div className="p-3.5 bg-orange-50 rounded-xl border border-orange-100 flex flex-col justify-between">
 <div className="flex items-start justify-between mb-2 gap-2">
 <div className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-wider leading-tight">
 Pending Drives
 </div>
 <Clock01Icon className="w-4 h-4 text-orange-400 shrink-0"/>
 </div>
 <div className="text-2xl font-black text-orange-900">{data.drivesAwaitingApproval}</div>
 </div>

 <div className="p-3.5 bg-success-muted rounded-xl border border-emerald-100 flex flex-col justify-between">
 <div className="flex items-start justify-between mb-2 gap-2">
 <div className="text-[10px] sm:text-xs font-bold text-success uppercase tracking-wider leading-tight">
 Active Drives
 </div>
 <Activity01Icon className="w-4 h-4 text-emerald-400 shrink-0"/>
 </div>
 <div className="text-2xl font-black text-emerald-900">{data.activeDrives}</div>
 </div>

 <div className="p-3.5 bg-info-muted rounded-xl border border-blue-100 flex flex-col justify-between">
 <div className="flex items-start justify-between mb-2 gap-2">
 <div className="text-[10px] sm:text-xs font-bold text-info uppercase tracking-wider leading-tight">
 Recent Activity01Icon
 </div>
 <Activity01Icon className="w-4 h-4 text-blue-400 shrink-0"/>
 </div>
 <div>
 <div className="text-2xl font-black text-blue-900">{data.recentDriveActivity}</div>
 <div className="text-[10px] text-info font-bold mt-0.5">Drives in last 7 days</div>
 </div>
 </div>
 </div>

 <div className="border border-border rounded-xl overflow-hidden">
 <div className="bg-muted px-4 py-3 border-b border-border flex items-center gap-2">
 <Calendar01Icon className="w-4 h-4 text-muted-foreground"/>
 <h3 className="font-bold text-sm text-foreground">Upcoming Events (Next 10)</h3>
 </div>

 {data.upcomingEvents?.length > 0 ? (
 <div className="divide-y divide-slate-50">
 {data.upcomingEvents.map((event) => (
 <div
 key={event.id}
 className="p-3 flex items-center justify-between hover:bg-muted/50"
 >
 <div>
 <div className="text-sm font-bold text-foreground">{event.companyName}</div>
 <div className="text-xs text-muted-foreground">
 {event.title} • {event.driveTitle}
 </div>
 </div>
 <div className="text-right">
 <div className="text-sm font-bold text-indigo-600">
 {event.date ? format(new Date(event.date), 'dd/MM/yyyy') : 'TBD'}
 </div>
 <div className="text-[10px] text-muted-foreground font-medium">
 {event.date ? format(new Date(event.date), 'h:mm a') : ''}
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="p-6 text-center text-muted-foreground text-sm">
 No upcoming events scheduled.
 </div>
 )}
 </div>
 </Card>
 );
}
