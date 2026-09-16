import { Card } from '@/components/ui';

export default function DepartmentHeatmap({ departments }: { departments: any[] }) {
 if (!departments || departments.length === 0) return null;

 // Find max/min ranges for coloring
 const maxRateChange = Math.max(...departments.map((d) => Math.abs(d.placementRateChange)));
 const maxPkgChange = Math.max(...departments.map((d) => Math.abs(d.packageChange)));

 // Helper to get color intensity based on value relative to max
 const getIntensityColor = (value: number, max: number, invert = false) => {
 if (value === 0) return 'bg-muted text-muted-foreground';

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
 <Card className="p-6 border-border">
 <div className="mb-6">
 <h3 className="text-lg font-bold text-foreground">Department Performance Heatmap</h3>
 <p className="text-sm text-muted-foreground mt-1">
 Decision-oriented matrix highlighting YoY improvement and decline.
 </p>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-muted border-y border-border text-muted-foreground">
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
 <tr key={i} className="hover:bg-muted/50 transition-colors">
 <td className="px-4 py-3 font-bold text-foreground">{dept.department}</td>
 <td className="px-4 py-3 text-center font-medium text-muted-foreground">
 {dept.previous?.placementRate?.toFixed(1)}%
 </td>
 <td className="px-4 py-3 text-center font-bold text-foreground">
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

 <div className="mt-6 flex flex-wrap gap-4 items-center text-xs font-medium text-muted-foreground">
 <span>Legend:</span>
 <div className="flex items-center gap-1.5">
 <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Strong Improvement
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div> Slight Improvement
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-3 h-3 bg-muted border border-border rounded-sm"></div> Stable
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
