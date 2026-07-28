import { useState } from 'react';
import { Filter, X, RefreshCw } from 'lucide-react';

interface CalendarFiltersProps {
  semesterConfig: any;
  onFilterChange: (filters: any) => void;
}

export default function CalendarFilters({ semesterConfig, onFilterChange }: CalendarFiltersProps) {
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState('semester7');
  const [week, setWeek] = useState('ALL');
  const [eventType, setEventType] = useState('ALL');

  const handleApply = () => {
    // If a specific week is selected, find the start and end dates from the config
    let weekDates = null;
    if (week !== 'ALL' && semesterConfig[semester]) {
      const selectedWeekObj = semesterConfig[semester].weeks.find((w: any) => w.id === parseInt(week));
      if (selectedWeekObj) {
        weekDates = { start: selectedWeekObj.start, end: selectedWeekObj.end };
      }
    }

    onFilterChange({
      academicYear,
      semester,
      week,
      weekDates,
      eventType
    });
  };

  const handleReset = () => {
    setAcademicYear('2026-2027');
    setSemester('semester7');
    setWeek('ALL');
    setEventType('ALL');
    onFilterChange({});
  };

  const currentSemesterWeeks = semesterConfig && semesterConfig[semester] ? semesterConfig[semester].weeks : [];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 mb-6">
      
      <div className="flex items-center gap-2 text-slate-500 mr-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-semibold">Filters:</span>
      </div>

      <select 
        className="text-sm border-slate-200 rounded-lg bg-slate-50 py-1.5 px-3 focus:ring-indigo-500 focus:border-indigo-500"
        value={academicYear}
        onChange={(e) => setAcademicYear(e.target.value)}
      >
        <option value="2026-2027">2026-2027</option>
        <option value="2027-2028">2027-2028</option>
      </select>

      <select 
        className="text-sm border-slate-200 rounded-lg bg-slate-50 py-1.5 px-3 focus:ring-indigo-500 focus:border-indigo-500"
        value={semester}
        onChange={(e) => { setSemester(e.target.value); setWeek('ALL'); }}
      >
        <option value="semester7">Semester 7</option>
        <option value="semester8">Semester 8</option>
      </select>

      <select 
        className="text-sm border-slate-200 rounded-lg bg-slate-50 py-1.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 max-w-[150px]"
        value={week}
        onChange={(e) => setWeek(e.target.value)}
      >
        <option value="ALL">All Weeks</option>
        {currentSemesterWeeks.map((w: any) => (
          <option key={w.id} value={w.id}>Week {w.id} ({new Date(w.start).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})})</option>
        ))}
      </select>

      <select 
        className="text-sm border-slate-200 rounded-lg bg-slate-50 py-1.5 px-3 focus:ring-indigo-500 focus:border-indigo-500"
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
      >
        <option value="ALL">All Event Types</option>
        <option value="Placement Drive">Placement Drives</option>
        <option value="Interview Schedule">Interviews</option>
        <option value="Deadline">Deadlines</option>
      </select>

      <div className="flex-1"></div>

      <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5">
        <RefreshCw className="w-3.5 h-3.5" /> Reset
      </button>

      <button onClick={handleApply} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg shadow-sm transition-colors">
        Apply Filters
      </button>

    </div>
  );
}
