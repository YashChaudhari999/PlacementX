import { Card } from '@/components/ui';
import { IndianRupee, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import type { SalaryResponse } from '@/types/analytics.types';

export default function SalaryAnalytics({ data }: { data: SalaryResponse }) {
  if (!data?.current?.distribution?.length) return null;

  const { current, insight } = data;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-bold text-sm mb-1">{label} LPA</p>
          <p className="text-slate-300">Offers: <span className="font-bold text-white">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
          <IndianRupee className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Package Distribution</h2>
          <p className="text-xs text-slate-500">Salary ranges across all placed students</p>
        </div>
      </div>

      {insight?.hasSkew && insight.description && (
        <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-200 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-violet-900">Salary Skew Detected</h4>
            <p className="text-sm text-violet-700 mt-1">{insight.description}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Average</div>
          <div className="text-xl font-black text-slate-900">₹{current.averagePackage.toFixed(2)}L</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Median (P50)</div>
          <div className="text-xl font-black text-slate-900">₹{current.medianPackage.toFixed(2)}L</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lower Quartile (P25)</div>
          <div className="text-xl font-black text-slate-900">₹{current.p25.toFixed(2)}L</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Upper Quartile (P75)</div>
          <div className="text-xl font-black text-slate-900">₹{current.p75.toFixed(2)}L</div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={current.distribution} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            
            <ReferenceLine x={current.distribution.find(d => {
              const [min, max] = d.label.replace('+', '-999').split('-').map(Number);
              return current.averagePackage >= min && current.averagePackage <= (max || 999);
            })?.label} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: '#3b82f6', fontSize: 10 }} />

            <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1000}>
              {current.distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#10b981" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
