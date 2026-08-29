import { Card } from '@/components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { YearComparisonRow } from '@/types/analytics.types';
import { Calendar01Icon } from 'hugeicons-react';
import { useState } from 'react';

type MetricKey =
  'placementRate' | 'averagePackage' | 'totalStudents' | 'placedStudents' | 'recruiters';

const metricLabels: Record<MetricKey, string> = {
  placementRate: 'Placement Rate (%)',
  averagePackage: 'Average Package (LPA)',
  totalStudents: 'Total Students',
  placedStudents: 'Placed Students',
  recruiters: 'Recruiting Companies',
};

export default function YearComparisonChart({ data }: { data: YearComparisonRow[] }) {
  const [primaryMetric, setPrimaryMetric] = useState<MetricKey>('placementRate');
  const [secondaryMetric, setSecondaryMetric] = useState<MetricKey>('averagePackage');

  if (!data?.length) return null;

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
            <Calendar01Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Year-over-Year Trends</h2>
            <p className="text-xs text-slate-500">Historical performance comparison</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={primaryMetric}
            onChange={(e) => setPrimaryMetric(e.target.value as MetricKey)}
            className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg outline-none cursor-pointer"
          >
            {Object.entries(metricLabels).map(([key, label]) => (
              <option key={key} value={key} disabled={key === secondaryMetric}>
                Left Axis: {label}
              </option>
            ))}
          </select>
          <select
            value={secondaryMetric}
            onChange={(e) => setSecondaryMetric(e.target.value as MetricKey)}
            className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg outline-none cursor-pointer"
          >
            <option value="">-- None --</option>
            {Object.entries(metricLabels).map(([key, label]) => (
              <option key={key} value={key} disabled={key === primaryMetric}>
                Right Axis: {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={10}
            />

            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#4f46e5' }}
              width={40}
            />

            {secondaryMetric && (
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#10b981' }}
                width={40}
              />
            )}

            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
            />

            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey={primaryMetric}
              name={metricLabels[primaryMetric]}
              stroke="#4f46e5"
              strokeWidth={3}
              activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
              animationDuration={1500}
            />

            {secondaryMetric && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={secondaryMetric}
                name={metricLabels[secondaryMetric]}
                stroke="#10b981"
                strokeWidth={3}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                animationDuration={1500}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
