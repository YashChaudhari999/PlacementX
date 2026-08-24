import { Card } from '@/components/ui';
import { Building, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import type { DepartmentResponse, DepartmentStats } from '@/types/analytics.types';
import { useState } from 'react';

type SortField = keyof DepartmentStats;
type SortOrder = 'asc' | 'desc';

export default function DepartmentAnalytics({ data }: { data: DepartmentResponse }) {
  const [sortField, setSortField] = useState<SortField>('placementRate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  if (!data?.departments?.length) return null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedDepts = [...data.departments].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === valB) return 0;
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
  });

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Department Intelligence</h2>
            <p className="text-xs text-slate-500">Performance across academic branches</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-900">{data.institutionRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Inst. Avg Rate</div>
        </div>
      </div>

      {data.risks?.length > 0 && (
        <div className="mb-6 space-y-2">
          {data.risks.map((risk, i) => (
            <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">{risk.department} Needs Intervention</h4>
                <p className="text-sm text-rose-700 mt-0.5">{risk.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 rounded-l-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('department')}>
                Department {sortField === 'department' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('totalStudents')}>
                Students {sortField === 'totalStudents' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('placementRate')}>
                Placement Rate {sortField === 'placementRate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('averagePackage')}>
                Avg Package {sortField === 'averagePackage' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 rounded-r-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('highestPackage')}>
                High Package {sortField === 'highestPackage' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedDepts.map((dept) => {
              const isBelowAvg = dept.placementRate < data.institutionRate - 5;
              return (
                <tr key={dept.department} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-4 font-bold text-slate-900">{dept.department}</td>
                  <td className="px-4 py-4 text-slate-600">
                    <div>{dept.totalStudents}</div>
                    <div className="text-[10px] text-slate-400">{dept.placedStudents} placed</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`font-black ${isBelowAvg ? 'text-rose-600' : 'text-slate-900'}`}>
                        {dept.placementRate.toFixed(1)}%
                      </div>
                      {dept.placementRateChange !== 0 && (
                        <div className="flex items-center text-[10px] font-bold">
                          {dept.placementRateChange > 0 ? (
                            <span className="text-emerald-500 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" />+{dept.placementRateChange.toFixed(1)}%</span>
                          ) : (
                            <span className="text-rose-500 flex items-center"><TrendingDown className="w-3 h-3 mr-0.5" />{dept.placementRateChange.toFixed(1)}%</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isBelowAvg ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${dept.placementRate}%` }} 
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-700">₹{dept.averagePackage.toFixed(2)}L</div>
                    {dept.packageChange !== 0 && (
                      <div className={`text-[10px] font-bold ${dept.packageChange > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {dept.packageChange > 0 ? '+' : ''}₹{dept.packageChange.toFixed(2)}L YoY
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-700">₹{dept.highestPackage.toFixed(2)}L</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
