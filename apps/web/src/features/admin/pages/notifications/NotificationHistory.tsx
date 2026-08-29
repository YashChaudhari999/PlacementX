import { useState } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { useNotificationHistory } from '@/hooks/queries/useAdminNotifications';
import {
  Search,
  Filter,
  Clock,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Bell,
  Eye,
  BarChart,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationHistory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

  const { data: res, isLoading } = useNotificationHistory({ page, limit: 25, search });
  const notifications = res?.data || [];
  const pagination = res?.pagination || { total: 0, page: 1, limit: 25, totalPages: 1 };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by title, type, or recipient group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 gap-2 bg-white text-slate-600">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button variant="outline" className="h-10 bg-white text-slate-600">
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Notification
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Audience
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Channels
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sent At
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading history...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No notifications found
                  </td>
                </tr>
              ) : (
                notifications.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedNotification(item)}
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">{item.type}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-700">{item.audienceDesc}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        {item.recipientCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {item.channels?.includes?.('Push') && (
                          <span title="Push">
                            <Smartphone className="w-4 h-4 text-slate-400" />
                          </span>
                        )}
                        {item.channels?.includes?.('In-App') && (
                          <span title="In-App">
                            <Bell className="w-4 h-4 text-slate-400" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-700">
                        {new Date(item.sentAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(item.sentAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                          <span>Delivered</span>
                          <span>{item.deliveryRate}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${item.deliveryRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              entries
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ─── Detail Drawer ─────────────────────────────────────────────── */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setSelectedNotification(null)}
        >
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]" />
          <div
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedNotification.title}
                </h2>
                <div className="text-sm font-medium text-slate-500 mt-1">
                  {selectedNotification.type} Notification
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Analytics Section */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <BarChart className="w-4 h-4" /> Delivery Analytics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-500 mb-1">Total Recipients</div>
                    <div className="text-xl font-bold text-slate-900">
                      {selectedNotification.recipientCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-emerald-700 mb-1">Delivered</div>
                    <div className="text-xl font-bold text-emerald-700">
                      {selectedNotification.deliveryRate}%
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-blue-700 mb-1">Read / Opened</div>
                    <div className="text-xl font-bold text-blue-700">
                      {selectedNotification.readRate}%
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-center items-center cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="text-xs font-bold text-indigo-600">View Full Report →</span>
                  </div>
                </div>
              </section>

              {/* Details Section */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500">Audience</div>
                    <div className="text-sm font-medium text-slate-900">
                      {selectedNotification.audienceDesc}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Sent By</div>
                    <div className="text-sm font-medium text-slate-900">
                      {selectedNotification.sentBy}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Timestamp</div>
                    <div className="text-sm font-medium text-slate-900">
                      {new Date(selectedNotification.sentAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Message Content Preview</div>
                    <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      We cannot show the exact individualized message for each of the{' '}
                      {selectedNotification.recipientCount} students here, but this is based on the
                      original template layout.
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Button
                className="w-full bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                variant="outline"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
