import { Card } from '@/components/ui';

export default function DepartmentHeatmap({ departments }: { departments: any[] }) {
  if (!departments || departments.length === 0) return null;

  // Find max/min ranges for coloring
  const maxRateChange = Math.max(...departments.map((d) => Math.abs(d.placementRateChange)));
  const maxPkgChange = Math.max(...departments.map((d) => Math.abs(d.packageChange)));

  // Helper to get color intensity based on value relative to max
  const getIntensityColor = (value: number, max: number, invert = false) => {
    if (value === 0) return 'bg-slate-50 text-slate-500';

    const ratio = max === 0 ? 0 : Math.abs(value) / max;
    const isPositive = invert ? value < 0 : value > 0;

    if (isPositive) {
      if (ratio > 0.7) return 'bg-emerald-500 text-white font-bold';
      if (ratio > 0.4) return 'bg-emerald-300 text-emerald-900';
      return 'bg-emerald-100 text-emerald-800';
    } else {
      if (ratio > 0.7) return 'bg-rose-500 text-white font-bold';
      if (ratio > 0.4) return 'bg-rose-300 text-rose-900';
      return 'bg-rose-100 text-rose-800';
    }
  };

  return (
    <Card className="p-6 border-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Department Performance Heatmap</h3>
        <p className="text-sm text-slate-500 mt-1">
          Decision-oriented matrix highlighting YoY improvement and decline.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">
                Department
              </th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-center">
                Previous %
              </th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-center">
                Current %
              </th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-center">
                Rate Change
              </th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-center">
                Avg Package Change
              </th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-center">
                Placed Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.map((dept, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-700">{dept.department}</td>
                <td className="px-4 py-3 text-center font-medium text-slate-500">
                  {dept.previous?.placementRate?.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-center font-bold text-slate-800">
                  {dept.current?.placementRate?.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <div
                    className={`px-2 py-1.5 rounded-md inline-block min-w-[70px] ${getIntensityColor(dept.placementRateChange, maxRateChange)}`}
                  >
                    {dept.placementRateChange > 0 ? '+' : ''}
                    {dept.placementRateChange.toFixed(1)} pp
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div
                    className={`px-2 py-1.5 rounded-md inline-block min-w-[90px] ${getIntensityColor(dept.packageChange, maxPkgChange)}`}
                  >
                    {dept.packageChange > 0 ? '+' : ''}₹{dept.packageChange.toFixed(2)} L
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div
                    className={`px-2 py-1.5 rounded-md inline-block min-w-[60px] ${getIntensityColor(dept.placedChange, 100)}`}
                  >
                    {dept.placedChange > 0 ? '+' : ''}
                    {dept.placedChange}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 items-center text-xs font-medium text-slate-500">
        <span>Legend:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Strong Improvement
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div> Slight Improvement
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded-sm"></div> Stable
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-rose-100 rounded-sm"></div> Slight Decline
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Strong Decline
        </div>
      </div>
    </Card>
  );
}
