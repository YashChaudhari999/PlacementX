import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Tick01Icon,
  Note01Icon,
  ViewIcon,
  Alert02Icon,
} from 'hugeicons-react';

const REPORT_TYPES = [
  {
    id: 'OVERALL_PLACEMENT',
    title: 'Overall Placement Statistics',
    description:
      'High-level metrics on total placed, unplaced, average packages, and top recruiters.',
  },
  {
    id: 'STUDENT_MASTER',
    title: 'Student Master Data',
    description: 'Comprehensive dump of all student academic and placement records.',
  },
  {
    id: 'UNPLACED_STUDENTS',
    title: 'Unplaced Students',
    description: 'List of students currently unplaced or pending offers.',
  },
  {
    id: 'DEPARTMENT_PERFORMANCE',
    title: 'Department-wise Performance',
    description: 'Aggregated placement metrics broken down by department.',
  },
  {
    id: 'COMPANY_HIRING',
    title: 'Company Hiring Summary',
    description: 'Overview of companies and the number of offers extended.',
  },
];

export default function ReportBuilder() {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState(REPORT_TYPES[0]?.id || 'OVERALL_PLACEMENT');
  const [filters, setFilters] = useState({
    academicYear: 'All',
    department: 'All',
    placementStatus: 'All',
  });
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const handleNext = async () => {
    if (step === 2) {
      // Fetch preview
      setPreviewLoading(true);
      try {
        const res = await api.post('/admin/reports/preview', { reportType, filters });
        setPreviewData(res.data.data);
      } catch (error) {
        console.error('Preview error:', error);
      } finally {
        setPreviewLoading(false);
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleExport = async (format: 'EXCEL' | 'CSV' | 'PDF') => {
    setGenerating(true);
    try {
      const res = await api.post('/admin/reports/generate', { reportType, filters, format });
      if (res.data.success) {
        const hId = res.data.data.historyId;
        setHistoryId(hId);

        // Poll for completion
        const interval = setInterval(async () => {
          try {
            const histRes = await api.get('/admin/reports/history');
            const target = histRes.data.data.find((h: any) => h.id === hId);
            if (target && target.status === 'COMPLETED') {
              clearInterval(interval);
              setGenerating(false);
              window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/reports/download/${hId}`;
            } else if (target && target.status === 'FAILED') {
              clearInterval(interval);
              setGenerating(false);
              alert('Report generation failed.');
            }
          } catch (e) {}
        }, 2000);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error.response?.data?.message || error.message));
      setGenerating(false);
    }
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      {/* Wizard Header */}
      <div className="bg-muted/30 px-6 py-4 border-b flex items-center justify-between">
        <div className="flex space-x-2">
          {['Select Type', 'Filters', 'Preview', 'Export'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${step > i + 1 ? 'bg-primary text-primary-foreground' : step === i + 1 ? 'border-2 border-primary text-primary' : 'bg-secondary text-muted-foreground'}
              `}
              >
                {step > i + 1 ? <Tick01Icon className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${step === i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
              {i < 3 && <ArrowRight01Icon className="w-4 h-4 mx-3 text-muted-foreground/50" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8">
        {step === 1 && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-semibold mb-2">Select Report Type</h2>
              <p className="text-muted-foreground text-sm">
                Choose the type of report you want to generate.
              </p>
            </div>
            <div className="grid gap-4">
              {REPORT_TYPES.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${reportType === type.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                >
                  <h3 className="font-medium text-foreground">{type.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-xl font-semibold mb-2">Configure Filters</h2>
              <p className="text-muted-foreground text-sm">Refine your dataset before exporting.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Academic Year</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.academicYear}
                  onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                >
                  <option value="All">All Years</option>
                  <option value="2026/2027">2026/2027</option>
                  <option value="2025/2026">2025/2026</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Department</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="IT Engineering">IT Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Placement Status</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.placementStatus}
                  onChange={(e) => setFilters({ ...filters, placementStatus: e.target.value })}
                >
                  <option value="All">All</option>
                  <option value="Placed">Placed</option>
                  <option value="Unplaced">Unplaced</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex mt-6">
              <Alert02Icon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You are about to query the database. Depending on the size of the dataset,
                generating the preview might take a few seconds.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 h-full flex flex-col">
            <div>
              <h2 className="text-xl font-semibold mb-2">Preview & Validate Data</h2>
              <p className="text-muted-foreground text-sm">
                Verify the data before generating the final export.
              </p>
            </div>

            {previewLoading ? (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : previewData ? (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="flex space-x-4">
                  {previewData.summary &&
                    Object.entries(previewData.summary).map(([key, val]) => (
                      <div key={key} className="bg-secondary px-4 py-2 rounded-lg">
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-lg font-bold">{String(val)}</p>
                      </div>
                    ))}
                </div>

                <div className="border rounded-md overflow-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                        {previewData.data.length > 0 &&
                          Object.keys(previewData.data[0]).map((k) => (
                            <th key={k} className="px-4 py-3 font-medium">
                              {k}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.slice(0, 10).map((row: any, i: number) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-4 py-2 whitespace-nowrap">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.data.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No data matches your filters.
                    </div>
                  )}
                  {previewData.data.length > 10 && (
                    <div className="p-2 text-center text-xs text-muted-foreground bg-muted/20 border-t">
                      Showing 10 of {previewData.count} records
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {step === 4 && (
          <div className="max-w-xl mx-auto mt-12 text-center space-y-8">
            {!historyId ? (
              <>
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Note01Icon className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Export Data</h2>
                  <p className="text-muted-foreground">
                    Choose your preferred format to export the data.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  {generating ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                  ) : (
                    <Tick01Icon className="w-10 h-10" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {generating ? 'Generating Report...' : 'Report Generated!'}
                  </h2>
                  <p className="text-muted-foreground">
                    {generating
                      ? 'Your report is being generated in the background. Please wait, it will download automatically.'
                      : 'Your report has been downloaded.'}
                  </p>
                </div>
              </>
            )}

            <div className="bg-muted/50 rounded-xl p-6 text-left border">
              <p className="text-sm text-muted-foreground mb-4">Export Options:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExport('EXCEL')}
                  disabled={generating || !!historyId}
                >
                  <Note01Icon className="mr-2 h-4 w-4 text-green-600" /> Excel
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExport('CSV')}
                  disabled={generating || !!historyId}
                >
                  <Note01Icon className="mr-2 h-4 w-4 text-blue-600" /> CSV
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExport('PDF')}
                  disabled={generating || !!historyId}
                >
                  <Note01Icon className="mr-2 h-4 w-4 text-red-600" /> PDF
                </Button>
              </div>

              {historyId && !generating && (
                <div className="mt-6 text-center">
                  <Button variant="link" className="mt-2" onClick={() => window.location.reload()}>
                    Generate Another Report
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {step < 4 && (
        <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            <ArrowLeft01Icon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext}>
            {step === 3 ? 'Proceed to Export' : 'Next Step'}
            {step !== 3 && <ArrowRight01Icon className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      )}
    </div>
  );
}
