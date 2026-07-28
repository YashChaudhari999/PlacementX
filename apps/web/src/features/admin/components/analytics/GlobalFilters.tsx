import { useSearchParams } from 'react-router-dom';
import { Filter, Calendar, Building, Briefcase, GraduationCap, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function GlobalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const currentYear = searchParams.get('currentYear') || '2026-2027';
  const previousYear = searchParams.get('previousYear') || '2025-2026';
  const season = searchParams.get('season') || 'All';
  const department = searchParams.get('department') || 'All';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 sticky top-0 z-40">
      {/* Top Bar */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Filter className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800">Global Filters</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
            <span className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">Compare</span>
            <select 
              value={currentYear} 
              onChange={e => updateFilter('currentYear', e.target.value)}
              className="text-sm font-bold bg-white border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>2026-2027</option>
              <option>2025-2026</option>
            </select>
            <span className="text-xs font-semibold text-slate-400 px-2">vs</span>
            <select 
              value={previousYear} 
              onChange={e => updateFilter('previousYear', e.target.value)}
              className="text-sm font-bold bg-white border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>2025-2026</option>
              <option>2024-2025</option>
            </select>
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Expanded Area */}
      {isExpanded && (
        <div className="p-4 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Placement Season
            </label>
            <select 
              value={season} 
              onChange={e => updateFilter('season', e.target.value)}
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>All</option>
              <option>Placement</option>
              <option>Summer Internship</option>
              <option>PPO</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Department
            </label>
            <select 
              value={department} 
              onChange={e => updateFilter('department', e.target.value)}
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>All</option>
              <option>Computer Engineering</option>
              <option>Information Technology</option>
              <option>Mechanical</option>
              <option>Civil</option>
            </select>
          </div>

          {/* Quick Clear */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end">
            <button 
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" /> Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
