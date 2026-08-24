import { Card } from '@/components/ui';
import { Activity, Clock, FileWarning, CalendarDays } from 'lucide-react';
import type { OperationalHealth as OperationalHealthType } from '@/types/analytics.types';
import { format } from 'date-fns';

export default function OperationalHealth({ data }: { data: OperationalHealthType }) {
  if (!data) return null;

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Operational Health</h2>
          <p className="text-xs text-slate-500">System and workflow status</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Profiles</div>
            <FileWarning className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-900">{data.pendingVerifications}</div>
        </div>

        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wider">Pending Drives</div>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-900">{data.drivesAwaitingApproval}</div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Drives</div>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{data.activeDrives}</div>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Recent Activity</div>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-900">{data.recentDriveActivity}</div>
          <div className="text-[10px] text-blue-600 font-bold mt-1">Drives in last 7 days</div>
        </div>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-700">Upcoming Events (Next 10)</h3>
        </div>
        
        {data.upcomingEvents?.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {data.upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                <div>
                  <div className="text-sm font-bold text-slate-900">{event.companyName}</div>
                  <div className="text-xs text-slate-500">{event.title} • {event.driveTitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-indigo-600">
                    {event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'TBD'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {event.date ? format(new Date(event.date), 'h:mm a') : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-sm">
            No upcoming events scheduled.
          </div>
        )}
      </div>
    </Card>
  );
}
