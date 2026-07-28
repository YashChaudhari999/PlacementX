import { useState, useRef } from 'react';
import { Card } from '@/components/ui';
import { Download, Maximize2, Minimize2, Table } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import html2canvas from 'html2canvas';

// --- Shared Wrapper --- //
const ChartWrapper = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const wrapperClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-white p-8 overflow-auto flex flex-col" 
    : "p-6 flex flex-col h-[400px]";

  return (
    <Card className={wrapperClass}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        <div className="flex gap-2">
          <button onClick={downloadImage} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Download Image">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div ref={chartRef} className="flex-1 w-full bg-white relative">
        {children}
      </div>
    </Card>
  );
};

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

// --- Charts Component --- //
export default function AnalyticsCharts({ charts }: { charts: any }) {
  if (!charts) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 1. Placement Trend */}
      <ChartWrapper title="Placement Trend (Month-wise)">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={charts.placementTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Area type="monotone" dataKey="previous" stroke="#94a3b8" fillOpacity={1} fill="url(#colorPrev)" name="Previous Year" />
            <Area type="monotone" dataKey="current" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCurrent)" name="Current Year" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* 2. Department Wise Placements */}
      <ChartWrapper title="Department-wise Placements">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.departmentWise} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar dataKey="previous" fill="#cbd5e1" name="Previous Year" radius={[0, 4, 4, 0]} />
            <Bar dataKey="current" fill="#3b82f6" name="Current Year" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* 3. Company Hiring Pipeline */}
      <ChartWrapper title="Top Recruiters Pipeline">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.companyHiring} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar dataKey="applied" stackId="a" fill="#93c5fd" name="Total Applied" />
            <Bar dataKey="selected" stackId="a" fill="#2563eb" name="Selected" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* 4. Package Distribution */}
      <ChartWrapper title="Package Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.packageDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar dataKey="previous" fill="#fca5a5" name="Previous Year" radius={[4, 4, 0, 0]} />
            <Bar dataKey="current" fill="#ef4444" name="Current Year" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* 5. Offer Acceptance Rate (Donut) */}
      <ChartWrapper title="Offer Acceptance Rate">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={charts.offerAcceptance}
              cx="50%" cy="50%"
              innerRadius={80} outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {charts.offerAcceptance.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* 6. Skills Demand */}
      <ChartWrapper title="Top Skills in Demand">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.skills} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <YAxis dataKey="text" type="category" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#64748b', fontSize: 12 }}>
              {charts.skills.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
      
      {/* 7. Student Funnel (using composed bar for simplicity) */}
      <ChartWrapper title="Student Conversion Funnel">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.funnel} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#64748b' }}>
              {charts.funnel.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* 8. Top Recruiters Leaderboard */}
      <Card className="p-6 h-[400px] flex flex-col overflow-hidden col-span-1 lg:col-span-2 xl:col-span-1">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-lg">Top Recruiters Leaderboard</h3>
          <div className="p-2 bg-slate-50 text-slate-500 rounded-lg"><Table className="w-4 h-4" /></div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Company</th>
                <th className="px-4 py-3">Hired</th>
                <th className="px-4 py-3">Highest (LPA)</th>
                <th className="px-4 py-3 rounded-tr-lg">Avg (LPA)</th>
              </tr>
            </thead>
            <tbody>
              {charts.leaderboard.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.company}</td>
                  <td className="px-4 py-3 text-indigo-600 font-bold">{row.studentsHired}</td>
                  <td className="px-4 py-3 text-emerald-600">{row.highestPackage}</td>
                  <td className="px-4 py-3 text-slate-600">{row.avgPackage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
