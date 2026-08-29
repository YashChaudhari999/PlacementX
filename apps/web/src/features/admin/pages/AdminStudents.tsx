import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, Input, Button, Badge } from '@/components/ui';
import { toast } from 'sonner';
import {
  Search,
  GraduationCap,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  UserPlus,
  Eye,
  Mail,
  Building2,
  BookOpen,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Briefcase,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  RotateCcw,
  ChevronDown,
  Send,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Papa from 'papaparse';
import { StudentImportService } from '@/features/admin/services/studentImportService';
import { auth } from '@/lib/firebase/config/firebaseApp';
import {
  useAdminStudents,
  useProvisionStudents,
  useStudentStats,
  usePendingProfiles,
  useUpdateRequests,
} from '@/hooks/queries/useAdmin';
import { ListSkeleton } from '@/components/common/Skeletons';

// ─── Utility helpers ───────────────────────────────────────────────────────────

function timeAgo(dateStr: string | Date | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getInitials(name: string | undefined): string {
  if (!name) return 'S';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function formatPackage(lpa: number | null | undefined): string {
  if (lpa === null || lpa === undefined) return '—';
  return `₹${lpa % 1 === 0 ? lpa : lpa.toFixed(1)} LPA`;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StudentFilters {
  search: string;
  department: string;
  placement_status: string;
  academic_year: string;
  min_cgpa: string;
  max_cgpa: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

const DEFAULT_FILTERS: StudentFilters = {
  search: '',
  department: '',
  placement_status: '',
  academic_year: '2026/2027',
  min_cgpa: '',
  max_cgpa: '',
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  limit: 25,
};

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function AdminStudents() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(t);
  }, [filters.search]);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedStudent(null);
        setActionMenuId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close action menu on outside click
  useEffect(() => {
    if (!actionMenuId) return;
    const handler = () => setActionMenuId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [actionMenuId]);

  // Query params for the backend
  const queryParams = useMemo(
    () => ({
      page: filters.page,
      limit: filters.limit,
      search: debouncedSearch || undefined,
      department: filters.department || undefined,
      placement_status: filters.placement_status || undefined,
      academic_year: filters.academic_year || undefined,
      min_cgpa: filters.min_cgpa || undefined,
      max_cgpa: filters.max_cgpa || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [
      filters.page,
      filters.limit,
      debouncedSearch,
      filters.department,
      filters.placement_status,
      filters.academic_year,
      filters.min_cgpa,
      filters.max_cgpa,
      filters.sortBy,
      filters.sortOrder,
    ]
  );

  const { data, isLoading, isError, refetch } = useAdminStudents(queryParams);
  const students: any[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 25, totalPages: 1 };

  const { data: stats, isLoading: statsLoading } = useStudentStats(filters.academic_year);
  const { data: pendingProfiles } = usePendingProfiles();
  const { data: updateRequests } = useUpdateRequests();
  const { mutate: provisionStudents, isPending: isProvisioning } = useProvisionStudents();

  const pendingVerificationCount = Array.isArray(pendingProfiles) ? pendingProfiles.length : 0;
  const pendingUpdateCount = Array.isArray(updateRequests) ? updateRequests.length : 0;

  // ─── Filter helpers ────────────────────────────────────────────────────────
  const updateFilter = useCallback((key: keyof StudentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
    setSelectedIds(new Set());
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedIds(new Set());
  }, []);

  const hasActiveFilters =
    filters.department ||
    filters.placement_status ||
    filters.min_cgpa ||
    filters.max_cgpa ||
    filters.search;

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof StudentFilters; label: string }[] = [];
    if (filters.department) chips.push({ key: 'department', label: `Dept: ${filters.department}` });
    if (filters.placement_status)
      chips.push({ key: 'placement_status', label: `Status: ${filters.placement_status}` });
    if (filters.min_cgpa) chips.push({ key: 'min_cgpa', label: `CGPA ≥ ${filters.min_cgpa}` });
    if (filters.max_cgpa) chips.push({ key: 'max_cgpa', label: `CGPA ≤ ${filters.max_cgpa}` });
    return chips;
  }, [filters.department, filters.placement_status, filters.min_cgpa, filters.max_cgpa]);

  // ─── Selection helpers ─────────────────────────────────────────────────────
  const allOnPageSelected =
    students.length > 0 && students.every((s: any) => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map((s: any) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Sort handler ──────────────────────────────────────────────────────────
  const handleSort = (col: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: col,
      sortOrder: prev.sortBy === col && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (filters.sortBy !== col)
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover/th:opacity-100 transition-opacity" />
      );
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600" />
    );
  };

  // ─── Import handler ────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportProgress(0);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.data.length === 0) {
          toast.error('CSV file is empty or has no valid rows.');
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        try {
          const adminUid = auth.currentUser?.uid || 'unknown_admin';
          const importResult = await StudentImportService.importStudents(
            results.data as any,
            adminUid,
            (progress) => setImportProgress(Math.round(progress))
          );
          if (importResult.imported > 0)
            toast.success(`Successfully imported ${importResult.imported} students!`);
          if (importResult.failed > 0)
            toast.error(`Failed to import ${importResult.failed} students.`);
          if (importResult.skipped > 0)
            toast(`Skipped ${importResult.skipped} empty/duplicate rows.`);
          await refetch();
        } catch (error: any) {
          toast.error(error.message || 'Failed to import students');
        } finally {
          setImporting(false);
          setImportProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast.error('Error parsing CSV: ' + error.message);
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Roll Number',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Gender',
      'Branch',
      'Password',
    ];
    const blob = new Blob([headers.join(',') + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Student_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }
    const exportData = students.map((s: any) => ({
      'Student ID': s.studentId,
      Name: s.name,
      Email: s.email,
      Department: s.branch,
      CGPA: s.cgpa,
      Backlogs: s.activeBacklogs,
      'Placement Status': s.status,
      Company: s.companyName || '',
      'Package (LPA)': s.fixedSalaryLpa || '',
      'Academic Year': s.academicYear,
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${students.length} students`);
  };

  const handleProvisionAccounts = () => {
    provisionStudents(undefined, {
      onSuccess: (res: any) => {
        const msg = res.stats
          ? `Accounts Created: ${res.stats.accountsCreated} | Profiles: ${res.stats.profilesCreated} | Existing: ${res.stats.alreadyExisting}`
          : 'Provisioning completed.';
        toast.success(msg, { duration: 6000 });
      },
    });
  };

  const handleSendNotification = () => {
    const ids = Array.from(selectedIds).join(',');
    navigate(`/admin/notifications?tab=send&selectedStudents=${ids}`);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage student profiles, verification, eligibility, applications and placement outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={handleDownloadTemplate}
          >
            <Download className="w-3.5 h-3.5" /> Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload className="w-3.5 h-3.5" /> {importing ? 'Importing…' : 'Import'}
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button
            size="sm"
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleProvisionAccounts}
            disabled={isProvisioning}
          >
            <UserPlus className="w-3.5 h-3.5" />{' '}
            {isProvisioning ? 'Provisioning…' : 'Provision Accounts'}
          </Button>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* ─── KPI Strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: 'Total Students',
            value: stats?.total,
            icon: Users,
            color: 'text-slate-700',
            bg: 'bg-white',
            filter: {},
          },
          {
            label: 'Placed',
            value: stats?.placed,
            icon: CheckCircle,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            filter: { placement_status: 'Placed' },
          },
          {
            label: 'Unplaced',
            value: stats?.unplaced,
            icon: XCircle,
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            filter: { placement_status: 'Unplaced' },
          },
          {
            label: 'Profile Complete',
            value: stats?.profileComplete,
            icon: FileText,
            color: 'text-blue-700',
            bg: 'bg-blue-50',
            filter: {},
          },
          {
            label: 'Avg CGPA',
            value: stats?.avgCgpa,
            icon: TrendingUp,
            color: 'text-violet-700',
            bg: 'bg-violet-50',
            filter: {},
          },
        ].map((kpi) => (
          <button
            key={kpi.label}
            onClick={() => {
              if (kpi.filter.placement_status)
                updateFilter('placement_status', kpi.filter.placement_status);
            }}
            className={`${kpi.bg} border border-slate-200/80 rounded-xl p-4 text-left hover:shadow-md transition-shadow group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <kpi.icon className={`w-4 h-4 ${kpi.color} opacity-60`} />
            </div>
            <div className={`text-2xl font-bold ${kpi.color} tracking-tight`}>
              {statsLoading ? (
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
              ) : (
                (kpi.value ?? '—')
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ─── Operational Alerts ─────────────────────────────────────────── */}
      {(pendingVerificationCount > 0 || pendingUpdateCount > 0) && (
        <div className="flex flex-col sm:flex-row gap-2">
          {pendingVerificationCount > 0 && (
            <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex-1">
              <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {pendingVerificationCount} Pending Verification
                  {pendingVerificationCount > 1 ? 's' : ''}
                </span>
              </div>
              <Link to="/admin/students/verifications" className="text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap">View →</Link>
            </div>
          )}
          {pendingUpdateCount > 0 && (
            <div className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex-1">
              <div className="flex items-center gap-2 text-blue-800 text-sm font-medium">
                <FileText className="w-4 h-4" />
                <span>
                  {pendingUpdateCount} Update Request{pendingUpdateCount > 1 ? 's' : ''}
                </span>
              </div>
              <Link to="/admin/students/update-requests" className="text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap">View →</Link>
            </div>
          )}
        </div>
      )}

      {/* ─── Search + Filters Toolbar ──────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name, ID or email…"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full h-9 pl-9 pr-8 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd
              className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-block text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1 py-0.5 pointer-events-none"
              style={{ display: filters.search ? 'none' : undefined }}
            >
              /
            </kbd>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={filters.department}
                onChange={(e) => updateFilter('department', e.target.value)}
                className="h-9 pl-3 pr-8 text-xs font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {(stats?.departments || []).map((d: any) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={filters.placement_status}
                onChange={(e) => updateFilter('placement_status', e.target.value)}
                className="h-9 pl-3 pr-8 text-xs font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Unplaced">Unplaced</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 px-3 text-xs font-medium border rounded-lg flex items-center gap-1.5 transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter className="w-3.5 h-3.5" /> More Filters
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="h-9 px-3 text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Min CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="0.0"
                value={filters.min_cgpa}
                onChange={(e) => updateFilter('min_cgpa', e.target.value)}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Max CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="10.0"
                value={filters.max_cgpa}
                onChange={(e) => updateFilter('max_cgpa', e.target.value)}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Academic Year</label>
              <input
                type="text"
                placeholder="e.g. 2026/2027"
                value={filters.academic_year}
                onChange={(e) => updateFilter('academic_year', e.target.value)}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2.5 py-1"
              >
                {chip.label}
                <button
                  onClick={() => updateFilter(chip.key, '')}
                  className="hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── Bulk Action Bar ───────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-20 bg-indigo-600 text-white rounded-lg px-4 py-2.5 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} student{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white text-indigo-600 hover:bg-slate-50 border-white/20 hover:text-indigo-700"
              onClick={handleSendNotification}
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Notify
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleExportCSV}
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleProvisionAccounts}
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" /> Provision
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setSelectedIds(new Set())}
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* ─── Import Progress Bar ───────────────────────────────────────── */}
      {importing && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span className="font-medium flex items-center gap-2">
              <Upload className="w-4 h-4 animate-bounce" /> Importing students…
            </span>
            <span className="font-mono text-xs">{importProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ─── Data Table ────────────────────────────────────────────────── */}
      <Card className="overflow-hidden border border-slate-200/80 shadow-sm">
        {isLoading ? (
          <div className="p-6">
            <ListSkeleton />
          </div>
        ) : isError ? (
          <div className="p-16 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-400" />
            <p className="text-base font-semibold text-slate-800">Unable to load students</p>
            <p className="text-sm text-slate-500 mt-1">
              Something went wrong while loading student data.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                        aria-label="Select all students"
                      />
                    </th>
                    {[
                      { key: 'name', label: 'Student', width: 'w-[22%]' },
                      { key: 'department', label: 'Department', width: 'w-[16%]' },
                      { key: 'cgpa', label: 'CGPA', width: '' },
                      { key: 'backlogs', label: 'Backlogs', width: '' },
                      { key: '', label: 'Profile', width: '' },
                      { key: '', label: 'Placement', width: '' },
                      { key: 'package', label: 'Package', width: '' },
                      { key: 'updated', label: 'Updated', width: '' },
                      { key: '', label: '', width: 'w-12' },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${col.width} ${col.key ? 'cursor-pointer select-none group/th hover:text-slate-700' : ''}`}
                        onClick={() => col.key && handleSort(col.key)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {col.key && <SortIcon col={col.key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-16 text-center">
                        <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-base font-semibold text-slate-700">
                          No students match your filters
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Try removing some filters or adjusting your search.
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={clearAllFilters}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    students.map((student: any) => (
                      <tr
                        key={student.id}
                        className={`transition-colors group ${selectedIds.has(student.id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80'}`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(student.id)}
                            onChange={() => toggleSelect(student.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                            aria-label={`Select ${student.name}`}
                          />
                        </td>

                        {/* Student */}
                        <td className="px-4 py-3">
                          <button
                            className="flex items-center gap-2.5 text-left w-full"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[11px] shrink-0">
                              {getInitials(student.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                                {student.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {student.studentId}
                              </div>
                            </div>
                          </button>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-700 truncate" title={student.branch}>
                            {student.branch}
                          </div>
                          <div className="text-[11px] text-slate-400">{student.academicYear}</div>
                        </td>

                        {/* CGPA */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-slate-900">
                            {student.cgpa !== null ? student.cgpa : '—'}
                          </span>
                        </td>

                        {/* Backlogs */}
                        <td className="px-4 py-3">
                          {student.activeBacklogs > 0 ? (
                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                              {student.activeBacklogs} Active
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">0</span>
                          )}
                        </td>

                        {/* Profile */}
                        <td className="px-4 py-3">
                          {student.profileComplete === 'Yes' ? (
                            <Badge variant="success" className="text-[11px] px-2 py-0.5">
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-[11px] px-2 py-0.5">
                              Incomplete
                            </Badge>
                          )}
                        </td>

                        {/* Placement */}
                        <td className="px-4 py-3">
                          {student.status === 'Placed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                              <CheckCircle className="w-3 h-3" /> Placed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                              Unplaced
                            </span>
                          )}
                        </td>

                        {/* Package */}
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm ${student.fixedSalaryLpa ? 'font-semibold text-slate-800' : 'text-slate-400'}`}
                          >
                            {formatPackage(student.fixedSalaryLpa)}
                          </span>
                        </td>

                        {/* Updated */}
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-slate-400">
                            {timeAgo(student.updatedAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuId(actionMenuId === student.id ? null : student.id);
                              }}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                              aria-label={`Actions for ${student.name}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {actionMenuId === student.id && (
                              <div
                                className="absolute right-0 top-8 z-30 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-44"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setActionMenuId(null);
                                  }}
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Profile
                                </button>
                                {student.email && (
                                  <button
                                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={() => {
                                      navigator.clipboard.writeText(student.email);
                                      toast.success('Email copied');
                                      setActionMenuId(null);
                                    }}
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Copy Email
                                  </button>
                                )}
                                {student.email && (
                                  <a
                                    href={`mailto:${student.email}`}
                                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 block"
                                  >
                                    <Mail className="w-3.5 h-3.5" /> Send Email
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ─── Pagination ────────────────────────────────────────────── */}
            {pagination.totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <div className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-medium text-slate-700">
                    {(pagination.page - 1) * pagination.limit + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-slate-700">
                    {pagination.total.toLocaleString()}
                  </span>{' '}
                  students
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filters.limit}
                    onChange={(e) => updateFilter('limit', Number(e.target.value))}
                    className="h-8 px-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-none"
                  >
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                  <div className="flex items-center">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => updateFilter('page', pagination.page - 1)}
                      className="h-8 w-8 flex items-center justify-center border border-slate-200 rounded-l-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="h-8 px-3 flex items-center text-xs font-medium text-slate-600 border-y border-slate-200 bg-white">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => updateFilter('page', pagination.page + 1)}
                      className="h-8 w-8 flex items-center justify-center border border-slate-200 rounded-r-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ─── Student Detail Drawer ─────────────────────────────────────── */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setSelectedStudent(null)}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
          <div
            className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {getInitials(selectedStudent.name)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h2>
                    <p className="text-sm text-slate-500 font-mono">{selectedStudent.studentId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Status Strip */}
              <div className="flex items-center gap-2 mt-4">
                {selectedStudent.status === 'Placed' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Placed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                    Unplaced
                  </span>
                )}
                {selectedStudent.profileComplete === 'Yes' ? (
                  <Badge variant="success" className="text-[11px]">
                    Profile Complete
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-[11px]">
                    Profile Incomplete
                  </Badge>
                )}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Contact */}
              <section>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <DetailRow label="Email" value={selectedStudent.email} />
                  <DetailRow label="Gender" value={selectedStudent.gender || '—'} />
                </div>
              </section>

              {/* Academic */}
              <section>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Academic Details
                </h3>
                <div className="space-y-2">
                  <DetailRow label="Department" value={selectedStudent.branch} />
                  <DetailRow label="Academic Year" value={selectedStudent.academicYear} />
                  <DetailRow
                    label="CGPA"
                    value={selectedStudent.cgpa !== null ? String(selectedStudent.cgpa) : '—'}
                  />
                  <DetailRow
                    label="Active Backlogs"
                    value={String(selectedStudent.activeBacklogs ?? 0)}
                    highlight={selectedStudent.activeBacklogs > 0}
                  />
                </div>
              </section>

              {/* Placement */}
              <section>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Placement Details
                </h3>
                <div className="space-y-2">
                  <DetailRow label="Status" value={selectedStudent.status} />
                  <DetailRow label="Company" value={selectedStudent.companyName || '—'} />
                  <DetailRow
                    label="Package"
                    value={formatPackage(selectedStudent.fixedSalaryLpa)}
                  />
                  <DetailRow
                    label="Application Status"
                    value={selectedStudent.applicationStatus || '—'}
                  />
                </div>
              </section>

              {/* Skills */}
              {selectedStudent.skills && (
                <section>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.skills.split(',').map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded-md px-2 py-1"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`font-medium ${highlight ? 'text-amber-700' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}
