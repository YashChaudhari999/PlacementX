import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Download01Icon, Note01Icon, TickDouble02Icon, Clock01Icon, CancelCircleIcon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';

export default function ReportHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/admin/reports/history');
      setHistory(res.data.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Poll every 10 seconds to update status of processing reports
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const getFormatIcon = (format: string) => {
    if (format === 'EXCEL') return <Note01Icon className="h-4 w-4 text-green-600" />;
    if (format === 'PDF') return <Note01Icon className="h-4 w-4 text-red-600" />;
    return <Note01Icon className="h-4 w-4 text-blue-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <TickDouble02Icon className="w-3 h-3 mr-1" /> Ready
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock01Icon className="w-3 h-3 mr-1 animate-spin-slow" /> Generating
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock01Icon className="w-3 h-3 mr-1" /> Queued
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <CancelCircleIcon className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Export History</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Download01Icon previously generated reports.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHistory}>
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
            <tr>
              <th className="px-6 py-4 font-medium">Report Name</th>
              <th className="px-6 py-4 font-medium">Generated On</th>
              <th className="px-6 py-4 font-medium">Records</th>
              <th className="px-6 py-4 font-medium">Format</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && history.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  Loading export history...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No reports have been generated yet.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{item.reportName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      ID: {item.id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.recordCount !== null ? item.recordCount.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center mt-2">
                    {getFormatIcon(item.format)}
                    <span className="ml-1.5">{item.format}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {item.status === 'COMPLETED' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        onClick={() =>
                          window.open(
                            `http://localhost:5000/api/admin/reports/download/${item.id}`,
                            '_blank'
                          )
                        }
                      >
                        <Download01Icon className="h-4 w-4 mr-2" />
                        Download01Icon
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" disabled>
                        Processing...
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
