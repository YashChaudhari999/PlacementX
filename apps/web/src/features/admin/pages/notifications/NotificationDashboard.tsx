import { useNotificationStats, useNotificationHistory, useNotificationRecommendations } from '@/hooks/queries/useAdminNotifications';
import { Card } from '@/components/ui';
import { 
  Send, CheckCircle, Eye, CalendarDays, AlertTriangle, 
  TrendingUp, Megaphone, Clock
} from 'lucide-react';

interface NotificationDashboardProps {
  onNavigate: (tab: string) => void;
}

export default function NotificationDashboard({ onNavigate }: NotificationDashboardProps) {
  const { data: stats, isLoading: statsLoading } = useNotificationStats();
  const { data: historyRes, isLoading: historyLoading } = useNotificationHistory({ limit: 5 });
  const recentHistory = historyRes?.data || [];
  const { data: recsData, isLoading: recsLoading } = useNotificationRecommendations();
  const recommendations = recsData?.data || [];

  return (
    <div className="space-y-6">
      {/* ─── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Sent', value: stats?.totalSent?.toLocaleString(), trend: `+${stats?.sentGrowth}%`, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Delivered', value: stats?.delivered?.toLocaleString(), trend: `${stats?.deliveryRate}%`, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Read', value: stats?.read?.toLocaleString(), trend: `${stats?.readRate}%`, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Scheduled', value: stats?.scheduled, trend: null, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Failed', value: stats?.failed, trend: `${stats?.failedRate}%`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-bold text-slate-900">
                {statsLoading ? <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" /> : kpi.value || '0'}
              </div>
              {kpi.trend && (
                <span className={`text-xs font-medium ${kpi.trend.startsWith('+') || parseFloat(kpi.trend) > 90 ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {kpi.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Recent History ────────────────────────────────────────────── */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-800">Recent Notifications</h3>
            <button 
              onClick={() => onNavigate('history')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Notification</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Audience</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Performance</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td></tr>
                ) : recentHistory.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">No recent notifications</td></tr>
                ) : (
                  recentHistory.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 text-sm">{item.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{item.type}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.sentAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-700">{item.audienceDesc}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.recipientCount.toLocaleString()} recipients</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Delivered</div>
                            <div className="text-sm font-medium text-slate-700">{item.deliveryRate}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Read</div>
                            <div className="text-sm font-medium text-slate-700">{item.readRate}%</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ─── Smart Suggestions ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">Recommended Actions</h3>
          
          {recsLoading ? (
            <div className="text-sm text-slate-500">Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <div className="text-sm text-slate-500">No new recommendations at this time.</div>
          ) : (
            recommendations.map((rec: any) => {
              let Icon = Megaphone;
              let colorClass = 'text-blue-500';
              let bgClass = 'bg-blue-50/30';
              let borderClass = 'border-l-blue-400 border-y-slate-200 border-r-slate-200';
              let btnClass = 'text-blue-700 hover:text-blue-800 bg-blue-100/50 hover:bg-blue-100';

              if (rec.type === 'warning') {
                Icon = AlertTriangle;
                colorClass = 'text-amber-500';
                bgClass = 'bg-amber-50/30';
                borderClass = 'border-l-amber-400 border-y-slate-200 border-r-slate-200';
                btnClass = 'text-amber-700 hover:text-amber-800 bg-amber-100/50 hover:bg-amber-100';
              } else if (rec.type === 'info') {
                Icon = CalendarDays;
                colorClass = 'text-indigo-500';
                bgClass = 'bg-indigo-50/30';
                borderClass = 'border-l-indigo-400 border-y-slate-200 border-r-slate-200';
                btnClass = 'text-indigo-700 hover:text-indigo-800 bg-indigo-100/50 hover:bg-indigo-100';
              }

              return (
                <Card key={rec.id} className={`p-4 border-l-4 shadow-sm ${borderClass} ${bgClass}`}>
                  <div className="flex gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${colorClass}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{rec.message}</p>
                      <button 
                        onClick={() => onNavigate(rec.actionLink)}
                        className={`mt-2 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${btnClass}`}
                      >
                        {rec.actionText}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
