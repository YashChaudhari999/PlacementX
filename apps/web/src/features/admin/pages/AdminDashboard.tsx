import { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Briefcase, 
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui';

// Mock Data for the Dashboard
const stats = [
  { label: 'Today\'s Drives', value: '3', icon: Building2, trend: 'Active now', color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Upcoming Drives', value: '5', icon: Clock, trend: 'Next 7 days', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { label: 'Open Drives', value: '12', icon: Briefcase, trend: 'Accepting applications', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { label: 'Closed Drives', value: '42', icon: FileCheck, trend: 'Completed', color: 'text-slate-600', bg: 'bg-slate-100' },
  { label: 'Students Applied Today', value: '156', icon: GraduationCap, trend: '+24% from yesterday', color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Eligible Students', value: '1,240', icon: CheckCircle2, trend: 'Ready for placement', color: 'text-amber-600', bg: 'bg-amber-100' },
  { label: 'Total Companies', value: '142', icon: Building2, trend: '+12% vs last year', color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { label: 'Total Offers', value: '856', icon: Briefcase, trend: '+24% vs last year', color: 'text-teal-600', bg: 'bg-teal-100' },
  { label: 'Highest Package', value: '42 LPA', icon: TrendingUp, trend: 'Top 5%', color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Average Package', value: '12.5 LPA', icon: TrendingUp, trend: '+1.5 LPA vs last year', color: 'text-fuchsia-600', bg: 'bg-fuchsia-100' },
  { label: 'Placement Percentage', value: '85%', icon: GraduationCap, trend: 'Target: 95%', color: 'text-rose-600', bg: 'bg-rose-100' },
  { label: 'Pending Reviews', value: '28', icon: Clock, trend: 'Action required', color: 'text-red-600', bg: 'bg-red-100' },
];



export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 font-medium">{stat.trend}</span>
                <span className="text-slate-400 ml-2">vs last year</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Current Drives Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">12 Open</p>
                  <p className="text-xs text-emerald-600">Accepting applications</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">5 Upcoming</p>
                  <p className="text-xs text-amber-600">Starts this week</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 rounded-lg text-slate-600">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">42 Closed</p>
                  <p className="text-xs text-slate-500">Completed drives</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
