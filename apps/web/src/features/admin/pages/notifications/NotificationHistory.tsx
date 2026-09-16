import { useState } from 'react';
import { Card, Input, Button } from '@/components/ui';
import { useNotificationHistory } from '@/hooks/queries/useAdminNotifications';
import {
 Search01Icon,
 FilterIcon,
 Clock01Icon,
 UserMultipleIcon,
 Cancel01Icon,
 ArrowLeft01Icon,
 ArrowRight01Icon,
 SmartPhone01Icon,
 Notification01Icon,
 ViewIcon,
 BarChartIcon,
 Tick02Icon,
} from 'hugeicons-react';
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
 <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
 <Input
 placeholder="Search by title, type, or recipient group..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="pl-9 h-10 bg-card"
 />
 </div>
 <div className="flex gap-2">
 <Button variant="outline"className="h-10 gap-2 bg-card text-muted-foreground">
 <FilterIcon className="w-4 h-4"/> Filters
 </Button>
 <Button variant="outline"className="h-10 bg-card text-muted-foreground">
 Export CSV
 </Button>
 </div>
 </div>

 <Card className="border-border shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[900px]">
 <thead>
 <tr className="bg-muted/80 border-b border-border">
 <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
 Notification
 </th>
 <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
 Audience
 </th>
 <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
 Channels
 </th>
 <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
 Sent At
 </th>
 <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
 Delivery
 </th>
 <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
 Status
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {isLoading ? (
 <tr>
 <td colSpan={6} className="p-8 text-center text-muted-foreground">
 Loading history...
 </td>
 </tr>
 ) : notifications.length === 0 ? (
 <tr>
 <td colSpan={6} className="p-8 text-center text-muted-foreground">
 No notifications found
 </td>
 </tr>
 ) : (
 notifications.map((item: any) => (
 <tr
 key={item.id}
 className="hover:bg-muted cursor-pointer transition-colors"
 onClick={() => setSelectedNotification(item)}
 >
 <td className="px-4 py-4">
 <div className="text-sm font-bold text-foreground">{item.title}</div>
 <div className="text-xs font-medium text-muted-foreground mt-0.5">{item.type}</div>
 </td>
 <td className="px-4 py-4">
 <div className="text-sm text-foreground">{item.audienceDesc}</div>
 <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
 <UserMultipleIcon className="w-3 h-3"/>
 {item.recipientCount.toLocaleString()}
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="flex gap-2">
 {item.channels?.includes?.('Push') && (
 <span title="Push">
 <SmartPhone01Icon className="w-4 h-4 text-muted-foreground"/>
 </span>
 )}
 {item.channels?.includes?.('In-App') && (
 <span title="In-App">
 <Notification01Icon className="w-4 h-4 text-muted-foreground"/>
 </span>
 )}
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="text-sm text-foreground">
 {new Date(item.sentAt).toLocaleDateString('en-GB', {
 day: '2-digit',
 month: '2-digit',
 year: 'numeric',
 })}
 </div>
 <div className="text-xs text-muted-foreground">
 {new Date(item.sentAt).toLocaleTimeString('en-US', {
 hour: '2-digit',
 minute: '2-digit',
 })}
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="w-32">
 <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mb-1">
 <span>Delivered</span>
 <span>{item.deliveryRate}%</span>
 </div>
 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
 <div
 className="h-full bg-emerald-500"
 style={{ width: `${item.deliveryRate}%` }}
 />
 </div>
 </div>
 </td>
 <td className="px-4 py-4 text-right">
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-muted text-emerald-700 border border-emerald-200">
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
 <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/50">
 <span className="text-xs text-muted-foreground">
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
 <ArrowLeft01Icon className="w-4 h-4"/>
 </Button>
 <Button
 variant="outline"
 size="sm"
 className="h-8 px-2"
 disabled={page === pagination.totalPages}
 onClick={() => setPage((p) => p + 1)}
 >
 <ArrowRight01Icon className="w-4 h-4"/>
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
 <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]"/>
 <div
 className="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="p-6 border-b border-border flex items-start justify-between bg-muted/50">
 <div>
 <h2 className="text-lg font-bold text-foreground leading-tight">
 {selectedNotification.title}
 </h2>
 <div className="text-sm font-medium text-muted-foreground mt-1">
 {selectedNotification.type} Notification
 </div>
 </div>
 <button
 onClick={() => setSelectedNotification(null)}
 className="p-1 text-muted-foreground hover:text-muted-foreground rounded"
 >
 <Cancel01Icon className="w-5 h-5"/>
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-6 space-y-8">
 {/* Analytics Section */}
 <section>
 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
 <BarChartIcon className="w-4 h-4"/> Delivery Analytics
 </h3>
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-muted border border-border rounded-lg p-3">
 <div className="text-xs font-medium text-muted-foreground mb-1">Total Recipients</div>
 <div className="text-xl font-bold text-foreground">
 {selectedNotification.recipientCount.toLocaleString()}
 </div>
 </div>
 <div className="bg-success-muted border border-emerald-200 rounded-lg p-3">
 <div className="text-xs font-medium text-emerald-700 mb-1">Delivered</div>
 <div className="text-xl font-bold text-emerald-700">
 {selectedNotification.deliveryRate}%
 </div>
 </div>
 <div className="bg-info-muted border border-blue-200 rounded-lg p-3">
 <div className="text-xs font-medium text-blue-700 mb-1">Read / Opened</div>
 <div className="text-xl font-bold text-blue-700">
 {selectedNotification.readRate}%
 </div>
 </div>
 <div className="bg-muted border border-border rounded-lg p-3 flex flex-col justify-center items-center cursor-pointer hover:bg-muted transition-colors">
 <span className="text-xs font-bold text-indigo-600">View Full Report →</span>
 </div>
 </div>
 </section>

 {/* Details Section */}
 <section className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
 Details
 </h3>
 <div className="space-y-3">
 <div>
 <div className="text-xs text-muted-foreground">Audience</div>
 <div className="text-sm font-medium text-foreground">
 {selectedNotification.audienceDesc}
 </div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Sent By</div>
 <div className="text-sm font-medium text-foreground">
 {selectedNotification.sentBy}
 </div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Timestamp</div>
 <div className="text-sm font-medium text-foreground">
 {new Date(selectedNotification.sentAt).toLocaleString('en-US', {
 dateStyle: 'medium',
 timeStyle: 'short',
 })}
 </div>
 </div>
 <div>
 <div className="text-xs text-muted-foreground mb-1">Message Content Preview</div>
 <div className="text-sm text-foreground bg-muted p-3 rounded-lg border border-border">
 We cannot show the exact individualized message for each of the{' '}
 {selectedNotification.recipientCount} students here, but this is based on the
 original template layout.
 </div>
 </div>
 </div>
 </section>
 </div>

 <div className="p-4 border-t border-border bg-muted">
 <Button
 className="w-full bg-card text-foreground border-border hover:bg-muted"
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
