import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, Button } from '@/components/ui';
import { toast } from 'sonner';
import { FileSpreadsheet, Download, RefreshCw, BarChart2 } from 'lucide-react';

export default function AdminReports() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/reports/data');
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (data.length === 0) {
      toast.error('No data available to download');
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const headers = Object.keys(data[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const row of data) {
        const values = headers.map(header => {
          const escaped = ('' + row[header]).replace(/"/g, '\\"');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `placement_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setGenerating(false);
      toast.success('Report downloaded successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Export Reports</h1>
          <p className="text-slate-500">Generate compliance reports and raw data extracts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col justify-between border border-slate-200">
          <div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Master Placement Report</h3>
            <p className="text-sm text-slate-500 mb-4">
              A complete extract of all student applications, including company details, roles, offered CTC, and final placement status. Perfect for NAAC/NBA accreditation.
            </p>
            <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded inline-block">
              {loading ? 'Loading records...' : `${data.length} records ready`}
            </div>
          </div>
          
          <Button 
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700" 
            onClick={downloadCSV}
            disabled={loading || data.length === 0 || generating}
          >
            {generating ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating CSV...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Download CSV</>
            )}
          </Button>
        </Card>

        <Card className="p-6 flex flex-col justify-between border border-slate-200 opacity-70">
          <div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Company Insights Report</h3>
            <p className="text-sm text-slate-500 mb-4">
              Aggregate data on hiring patterns, average package by company, and year-over-year growth metrics.
            </p>
            <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded inline-block">
              Coming Soon
            </div>
          </div>
          
          <Button className="w-full mt-6" variant="outline" disabled>
            Not Available Yet
          </Button>
        </Card>
      </div>
    </div>
  );
}
