import { useState, useRef } from 'react';
import { Card } from '@/components/ui';
import { Download, Maximize2, Minimize2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import html2canvas from 'html2canvas';

// --- Shared Wrapper --- //
const ChartWrapper = ({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) => {
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
    : `p-6 flex flex-col h-[400px] ${className}`;

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

export default function AnalyticsCharts({ overview, departments, yearComparison }: { overview: any, departments: any[], yearComparison: any[] }) {
  if (!overview || !departments || !yearComparison) return null;
  
  // Format data for Recharts
  const pieData = [
    { name: 'Placed', value: overview.current?.placedStudents || 0 },
    { name: 'Unplaced', value: overview.current?.unplacedStudents || 0 }
  ];
  
  const deptData = departments.map(d => ({
    department: d.department,
    prevPlaced: d.previous?.placed || 0,
    currPlaced: d.current?.placed || 0,
    prevUnplaced: (d.previous?.total || 0) - (d.previous?.placed || 0),
    currUnplaced: (d.current?.total || 0) - (d.current?.placed || 0)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 1. Placement Status Overview */}
      <ChartWrapper title="Overall Placement Status (Current Year)">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%" cy="50%"
              innerRadius={80} outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* 2. Year over Year comparison Trend */}
      <ChartWrapper title="Year-over-Year Placement Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={yearComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="placementRate" stroke="#8b5cf6" strokeWidth={3} name="Placement Rate (%)" />
            <Line yAxisId="right" type="monotone" dataKey="totalStudents" stroke="#93c5fd" strokeWidth={3} name="Total Students" />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* 3. Department Wise Placements */}
      <ChartWrapper title="Department-wise Placed Students (YoY Comparison)" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={deptData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="department" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 11}} />
            <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar dataKey="prevPlaced" fill="#94a3b8" name="Previous Year Placed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="currPlaced" fill="#3b82f6" name="Current Year Placed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
      
    </div>
  );
}
