import { Card } from '@/components/ui';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ForecastResponse } from '@/types/analytics.types';
import { useMemo } from 'react';

// Mock historical data combined with forecast data
// In a real app, this would combine YearComparison data with Forecast data
const generateChartData = (forecast: ForecastResponse) => {
  const currentYearStr = (forecast.targetYear as string) || ''; // e.g., "2026/2027"
  const baseYear = currentYearStr ? parseInt(currentYearStr.split('/')[0]) : new Date().getFullYear(); // 2026

  const baseRate = forecast.projectedPlacementRate ? forecast.projectedPlacementRate - 5 : 75;
  const rateDelta = forecast.projectedPlacementRate
    ? (forecast.projectedPlacementRate - baseRate) / 3
    : 2;

  const data = [
    {
      year: `${baseYear - 3}/${baseYear - 2}`,
      placementRate: baseRate - rateDelta * 3,
      isHistorical: true,
    },
    {
      year: `${baseYear - 2}/${baseYear - 1}`,
      placementRate: baseRate - rateDelta * 2,
      isHistorical: true,
    },
    { year: `${baseYear - 1}/${baseYear}`, placementRate: baseRate, isHistorical: true },
    {
      year: currentYearStr || `${baseYear}/${baseYear + 1}`,
      placementRate: forecast.projectedPlacementRate || baseRate,
      isForecast: true,
      range: forecast.confidenceInterval
        ? [forecast.confidenceInterval[0], forecast.confidenceInterval[1]]
        : null,
    },
  ];

  return data;
};

export default function ForecastChart({ data }: { data: ForecastResponse }) {
  const chartData = useMemo(() => generateChartData(data), [data]);

  if (!data?.projectedPlacementRate && !data?.error) return null;

  return (
    <Card className="p-6 border-slate-200 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-bold text-indigo-700">AI Powered</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Placement Forecast</h2>
          <p className="text-xs text-slate-500">Predicted placement rate for {data.targetYear}</p>
        </div>
      </div>

      {data.error ? (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <p className="text-sm font-medium text-slate-500">Forecast unavailable: {data.error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                Projected Rate
              </div>
              <div className="text-2xl font-black text-indigo-900">
                {data.projectedPlacementRate?.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Confidence Interval
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1.5">
                {data.confidenceInterval?.[0]?.toFixed(1)}% -{' '}
                {data.confidenceInterval?.[1]?.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Trend
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {data.trend === 'up' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                {data.trend === 'down' && <TrendingDown className="w-5 h-5 text-rose-500" />}
                {data.trend === 'stable' && <Minus className="w-5 h-5 text-slate-400" />}
                <span className="text-lg font-bold text-slate-900 capitalize">{data.trend}</span>
              </div>
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                />

                <ReferenceLine
                  x={chartData[2]?.year}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  label={{
                    position: 'top',
                    value: 'Forecast Start',
                    fill: '#94a3b8',
                    fontSize: 10,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="placementRate"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  );
}
