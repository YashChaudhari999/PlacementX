import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Note01Icon,
  Download01Icon,
  Calendar01Icon,
  UserMultipleIcon,
  Briefcase01Icon,
  ArrowRight01Icon,
} from 'hugeicons-react';
import { Button } from '@/components/ui/button';

interface KPIs {
  reportsGenerated: number;
  exportsThisMonth: number;
  scheduledReports: number;
  studentsReported: number;
  placementDrives: number;
  lastExport: string | null;
}

export default function ReportsOverview({
  onNavigateToBuilder,
}: {
  onNavigateToBuilder: () => void;
}) {
  const { data: kpis, isLoading: loading } = useQuery({
    queryKey: ['adminReportsKPIs'],
    queryFn: async () => {
      const response = await api.get('/admin/reports/kpis');
      return response.data.data;
    },
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-secondary rounded-xl"></div>
        <div className="h-64 bg-secondary rounded-xl"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Reports Generated',
      value: kpis?.reportsGenerated || 0,
      icon: Note01Icon,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Exports This Month',
      value: kpis?.exportsThisMonth || 0,
      icon: Download01Icon,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Active Scheduled Reports',
      value: kpis?.scheduledReports || 0,
      icon: Calendar01Icon,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: 'Students in Database',
      value: kpis?.studentsReported || 0,
      icon: UserMultipleIcon,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Placement Drives',
      value: kpis?.placementDrives || 0,
      icon: Briefcase01Icon,
      color: 'text-pink-500',
      bg: 'bg-pink-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="bg-card border rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div>
          <h3 className="text-lg font-semibold">Generate a New Report</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Build custom reports, filter by criteria, preview data, and export to Excel/PDF.
          </p>
        </div>
        <Button onClick={onNavigateToBuilder} className="mt-4 md:mt-0 shadow-sm" size="lg">
          Open Report Builder
          <ArrowRight01Icon className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* KPI Grid */}
      <div>
        <h3 className="text-lg font-medium mb-4">Reporting Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-card border rounded-xl p-5 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h4 className="font-medium flex items-center mb-4">
            <Calendar01Icon className="h-5 w-5 mr-2 text-primary" />
            Last Export Details
          </h4>
          <div className="text-sm">
            {kpis?.lastExport ? (
              <p>
                The last report was generated on{' '}
                <span className="font-semibold">{new Date(kpis.lastExport).toLocaleString()}</span>.
              </p>
            ) : (
              <p className="text-muted-foreground">No reports have been generated yet.</p>
            )}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h4 className="font-medium flex items-center mb-4">
            <Note01Icon className="h-5 w-5 mr-2 text-primary" />
            Available Report Types
          </h4>
          <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
            <li>Overall Placement Statistics</li>
            <li>Student Master Data</li>
            <li>Unplaced Students List</li>
            <li>Department-wise Performance</li>
            <li>Company Hiring Summary</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
