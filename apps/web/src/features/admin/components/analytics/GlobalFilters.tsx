import {
  Cancel01Icon,
  FilterIcon,
  RefreshIcon,
  Download01Icon,
  Settings02Icon,
} from 'hugeicons-react';
import { useFilterOptions } from '@/hooks/queries/useAnalytics';
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters';
import { analyticsService } from '@/services/analytics.service';
import { useState } from 'react';

const chipColors: Record<string, string> = {
  academicYear: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  compareWith: 'bg-violet-100 text-violet-700 border-violet-200',
  department: 'bg-teal-100 text-teal-700 border-teal-200',
  companyName: 'bg-amber-100 text-amber-700 border-amber-200',
  placementStatus: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
};

const filterLabels: Record<string, string> = {
  academicYear: 'Year',
  compareWith: 'Compare',
  department: 'Dept',
  companyName: 'Company',
  placementStatus: 'Status',
  jobRole: 'Role',
  minSalary: 'Min ₹',
  maxSalary: 'Max ₹',
};

export default function GlobalFilters() {
  const { filters, updateFilter, clearFilters, hasActiveFilters, activeFilterCount } =
    useAnalyticsFilters();
  const { data: options, isLoading: optionsLoading } = useFilterOptions();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const academicYears = options?.academicYears || [];
  const departments = options?.departments || [];
  const companies = options?.companies || [];

  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'placement_report.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const activeFilters = Object.entries(filters).filter(
    ([key, value]) =>
      value !== undefined &&
      value !== '' &&
      !['page', 'pageSize', 'sortBy', 'sortOrder'].includes(key)
  );

  return (
    <div className="space-y-3">
      {/* ── Primary Filter Bar ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 shrink-0">
            <FilterIcon className="w-4 h-4" />
            <span className="text-sm font-bold">Filters</span>
          </div>

          {/* Academic Year */}
          <select
            className="px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[140px]"
            value={filters.academicYear || 'All Years'}
            onChange={(e) => updateFilter('academicYear', e.target.value)}
          >
            <option value="All Years">All Years</option>
            {academicYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Compare With */}
          <select
            className="px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[140px]"
            value={filters.compareWith || ''}
            onChange={(e) => updateFilter('compareWith', e.target.value || undefined)}
          >
            <option value="">Compare with...</option>
            {academicYears
              .filter((y) => y !== filters.academicYear)
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
          </select>

          {/* Department */}
          <select
            className="px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[160px]"
            value={filters.department || ''}
            onChange={(e) => updateFilter('department', e.target.value || undefined)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Placement Status */}
          <select
            className="px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[120px]"
            value={filters.placementStatus || ''}
            onChange={(e) => updateFilter('placementStatus', e.target.value || undefined)}
          >
            <option value="">All Status</option>
            <option value="Placed">Placed</option>
            <option value="Not Placed">Not Placed</option>
          </select>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 text-sm font-medium rounded-xl border transition-colors flex items-center gap-1.5 ${
              showAdvanced
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings02Icon className="w-3.5 h-3.5" />
            Advanced
          </button>

          <div className="flex-1" />

          {/* Actions */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                clearFilters();
                setShowAdvanced(false);
              }}
              className="px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              Clear ({activeFilterCount})
            </button>
          )}

          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download01Icon className="w-3.5 h-3.5" />
            Export
          </button>
        </div>

        {/* ── Advanced Filters ──────────────────────── */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Company */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Company
              </label>
              <select
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={filters.companyName || ''}
                onChange={(e) => updateFilter('companyName', e.target.value || undefined)}
              >
                <option value="">All Companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Role */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Job Role
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none placeholder:text-slate-400"
                placeholder="Filter by role..."
                value={filters.jobRole || ''}
                onChange={(e) => updateFilter('jobRole', e.target.value || undefined)}
              />
            </div>

            {/* Min Salary */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Min Salary (LPA)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none placeholder:text-slate-400"
                placeholder="0"
                value={filters.minSalary || ''}
                onChange={(e) =>
                  updateFilter('minSalary', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>

            {/* Max Salary */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Max Salary (LPA)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none placeholder:text-slate-400"
                placeholder="100"
                value={filters.maxSalary || ''}
                onChange={(e) =>
                  updateFilter('maxSalary', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Active Filter Chips ─────────────────────── */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${
                chipColors[key] || chipColors.default
              }`}
            >
              <span className="opacity-70">{filterLabels[key] || key}:</span>
              <span>{String(value)}</span>
              <button
                onClick={() => updateFilter(key as any, undefined)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
              >
                <Cancel01Icon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
