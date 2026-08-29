import { Card } from '@/components/ui';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { DepartmentResponse } from '@/types/analytics.types';
import { Target01Icon } from 'hugeicons-react';

export default function DepartmentPerformanceChart({ data }: { data: DepartmentResponse }) {
  if (!data?.departments?.length) return null;

  const chartData = data.departments.map((d) => ({
    name: d.department,
    x: d.placementRate, // X-axis: Placement Rate %
    y: d.averagePackage, // Y-axis: Average Package (LPA)
    z: d.totalStudents, // Bubble size
    placed: d.placedStudents,
  }));

  const avgPlacementRate = data.institutionRate;
  const avgPackage = chartData.reduce((acc, curr) => acc + curr.y, 0) / chartData.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
          <p className="font-bold text-sm mb-1">{data.name}</p>
          <div className="space-y-1 text-slate-300">
            <p>
              Placement Rate: <span className="font-bold text-white">{data.x.toFixed(1)}%</span>
            </p>
            <p>
              Avg Package: <span className="font-bold text-white">₹{data.y.toFixed(2)} LPA</span>
            </p>
            <p>
              Students: <span className="font-bold text-white">{data.z}</span> ({data.placed}{' '}
              placed)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
          <Target01Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Performance Quadrant</h2>
          <p className="text-xs text-slate-500">
            Placement Rate vs Average Package (Bubble size = Total Students)
          </p>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              type="number"
              dataKey="x"
              name="Placement Rate"
              unit="%"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              type="number"
              dataKey="y"
              name="Average Package"
              unit="LPA"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Students" />

            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />

            {/* Institution Averages as Reference Lines to create quadrants */}
            <ReferenceLine
              x={avgPlacementRate}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ position: 'top', value: 'Avg Rate', fill: '#94a3b8', fontSize: 10 }}
            />
            <ReferenceLine
              y={avgPackage}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ position: 'right', value: 'Avg Pkg', fill: '#94a3b8', fontSize: 10 }}
            />

            <Scatter data={chartData} animationDuration={1000}>
              {chartData.map((entry, index) => {
                // Determine color based on quadrant
                const isHighRate = entry.x >= avgPlacementRate;
                const isHighPkg = entry.y >= avgPackage;
                let color = '#3b82f6'; // Default Blue

                if (isHighRate && isHighPkg)
                  color = '#10b981'; // Green (Star)
                else if (!isHighRate && !isHighPkg)
                  color = '#f43f5e'; // Red (Risk)
                else if (isHighRate && !isHighPkg)
                  color = '#f59e0b'; // Yellow (High volume, low value)
                else if (!isHighRate && isHighPkg) color = '#8b5cf6'; // Purple (Low volume, high value)

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={0.6}
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500/60 ring-1 ring-emerald-500" /> Stars
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500/60 ring-1 ring-amber-500" /> High Rate,
          Low Pkg
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-violet-500/60 ring-1 ring-violet-500" /> High Pkg,
          Low Rate
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/60 ring-1 ring-rose-500" /> At Risk
        </div>
      </div>
    </Card>
  );
}
