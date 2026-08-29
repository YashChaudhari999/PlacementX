import { Card } from '@/components/ui';
import { Briefcase01Icon, Money01Icon, UserMultipleIcon, TickDouble02Icon } from 'hugeicons-react';
import type { DriveAnalyticsResponse } from '@/types/analytics.types';
import { useState } from 'react';

export default function DriveAnalytics({ data }: { data: DriveAnalyticsResponse }) {
  const [showAll, setShowAll] = useState(false);

  if (!data?.drives?.length) return null;

  const { drives, summary } = data;
  const displayDrives = showAll ? drives : drives.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200 bg-white">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Drives
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.totalDrives}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            <span className="text-emerald-600 font-bold">{summary.activeDrives}</span> Active
          </div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Applications
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary.totalApplications.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Across all drives</div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Avg Apps/Drive
          </div>
          <div className="text-2xl font-black text-slate-900">
            {summary.avgApplicationsPerDrive.toFixed(0)}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Student engagement</div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Offers
          </div>
          <div className="text-2xl font-black text-slate-900">{summary.totalOffers}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">From tracked drives</div>
        </Card>
      </div>

      <Card className="border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
            <Briefcase01Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Drive Performance</h3>
            <p className="text-xs text-slate-500">Conversion and engagement per drive</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Drive / Company</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Package</th>
                <th className="px-6 py-3">Funnel</th>
                <th className="px-6 py-3">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayDrives.map((drive) => (
                <tr key={drive.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{drive.companyName}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">
                      {drive.jobRole || drive.driveTitle || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        drive.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : drive.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {drive.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {drive.packageLpa ? `₹${drive.packageLpa.toFixed(2)}L` : 'TBD'}
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <div className="flex items-center gap-1">
                        <UserMultipleIcon className="w-3 h-3 text-blue-500" /> {drive.applied}
                      </div>
                      <div className="flex items-center gap-1">
                        <TickDouble02Icon className="w-3 h-3 text-emerald-500" /> {drive.offered}
                      </div>
                    </div>
                    <div className="flex h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      {drive.totalApplications > 0 && (
                        <>
                          <div
                            className="bg-emerald-500"
                            style={{ width: `${(drive.offered / drive.totalApplications) * 100}%` }}
                          />
                          <div
                            className="bg-indigo-500"
                            style={{
                              width: `${(drive.interviewed / drive.totalApplications) * 100}%`,
                            }}
                          />
                          <div
                            className="bg-blue-500"
                            style={{
                              width: `${(drive.shortlisted / drive.totalApplications) * 100}%`,
                            }}
                          />
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`font-black ${drive.offerConversion > 10 ? 'text-emerald-600' : drive.offerConversion > 0 ? 'text-slate-900' : 'text-slate-400'}`}
                      >
                        {drive.offerConversion.toFixed(1)}%
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {drives.length > 10 && (
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              {showAll ? 'Show Less' : `View All ${drives.length} Drives`}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
