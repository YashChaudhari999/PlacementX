import { useState, useEffect, useMemo } from 'react';
import { FilterIcon, Calendar01Icon, BookOpen01Icon, Layers01Icon, Tick01Icon, ArrowDown01Icon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarFiltersProps {
  semesterConfig: any; // Legacy format
  fullConfig?: any[]; // New dynamic format from DB
  onFilterChange: (filters: any) => void;
}

export default function CalendarFilters({
  semesterConfig,
  fullConfig,
  onFilterChange,
}: CalendarFiltersProps) {
  const [filters, setFilters] = useState<{
    academicYear: string;
    semester: string;
    week: string;
    eventType: string;
    weekDates?: any;
  }>({
    academicYear: '',
    semester: '',
    week: 'ALL',
    eventType: 'ALL',
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Initialize filters based on dynamic config
  useEffect(() => {
    if (fullConfig && fullConfig.length > 0 && !filters.academicYear) {
      const activeYear = fullConfig.find((y) => y.isActive) || fullConfig[0];
      const activeSem =
        activeYear.semesters.find((s: any) => s.isActive) || activeYear.semesters[0];

      setFilters((prev) => ({
        ...prev,
        academicYear: activeYear.id,
        semester: activeSem ? activeSem.id : '',
      }));
    }
  }, [fullConfig]);

  useEffect(() => {
    // Pass the correct structure back to parent
    if (filters.academicYear && filters.semester) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const EVENT_TYPES = [
    { value: 'ALL', label: 'All Events', color: 'bg-slate-200' },
    { value: 'Placement Drive', label: 'Drives', color: 'bg-indigo-500' },
    { value: 'Interview Schedule', label: 'Interviews', color: 'bg-emerald-500' },
    { value: 'Meeting', label: 'Meetings', color: 'bg-blue-500' },
    { value: 'Deadline', label: 'Deadlines', color: 'bg-red-500' },
    { value: 'General', label: 'General', color: 'bg-slate-500' },
    { value: 'Holiday', label: 'Holidays', color: 'bg-amber-500' },
  ];

  // Derived options based on selections
  const selectedYearObj = useMemo(
    () => fullConfig?.find((y) => y.id === filters.academicYear),
    [fullConfig, filters.academicYear]
  );
  const availableSemesters = selectedYearObj?.semesters || [];

  const selectedSemesterObj = useMemo(() => {
    // If fullConfig is present, use it. Otherwise fallback to legacy
    if (fullConfig) return availableSemesters.find((s: any) => s.id === filters.semester);
    return semesterConfig ? semesterConfig[filters.semester] : null;
  }, [availableSemesters, filters.semester, fullConfig, semesterConfig]);

  const availableWeeks = selectedSemesterObj?.weeks || [];

  const updateFilter = (key: string, value: any) => {
    let newFilters = { ...filters, [key]: value };

    // Cascading resets
    if (key === 'academicYear') {
      const newYearObj = fullConfig?.find((y) => y.id === value);
      const newSem = newYearObj?.semesters?.[0]?.id || '';
      newFilters = { ...newFilters, semester: newSem, week: 'ALL' };
      delete (newFilters as any).weekDates;
    } else if (key === 'semester') {
      newFilters = { ...newFilters, week: 'ALL' };
      delete (newFilters as any).weekDates;
    } else if (key === 'week' && value !== 'ALL') {
      const weekConfig = availableWeeks.find(
        (w: any) => w.weekNumber.toString() === value.toString()
      );
      newFilters = { ...newFilters, weekDates: weekConfig };
    } else if (key === 'week' && value === 'ALL') {
      delete (newFilters as any).weekDates;
    }

    setFilters(newFilters);
    setActiveDropdown(null);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 30 },
    },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-3 rounded-[24px] mb-6 flex flex-wrap gap-3 items-center relative z-20"
    >
      <div className="flex items-center gap-2 pl-3 pr-4 py-2 border-r border-slate-200/60">
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
          <FilterIcon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">Filters</span>
      </div>

      {/* Academic Year FilterIcon */}
      {fullConfig && (
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
            className={`flex items-center gap-2 px-5 py-3 rounded-[16px] text-sm font-semibold transition-all shadow-sm ${activeDropdown === 'year' ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
          >
            <BookOpen01Icon
              className={`w-4 h-4 ${activeDropdown === 'year' ? 'text-indigo-200' : 'text-slate-400'}`}
            />
            {selectedYearObj?.year || 'Select Year'}
            <ArrowDown01Icon
              className={`w-4 h-4 transition-transform ${activeDropdown === 'year' ? 'rotate-180 text-white' : 'text-slate-400'}`}
            />
          </button>

          <AnimatePresence>
            {activeDropdown === 'year' && (
              <motion.div
                variants={dropdownVariants as any}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-3 w-48 bg-white/90 backdrop-blur-2xl rounded-[20px] border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-2 z-50 overflow-hidden"
              >
                <div className="space-y-1">
                  {fullConfig.map((year) => (
                    <button
                      key={year.id}
                      onClick={() => updateFilter('academicYear', year.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-colors text-left group ${filters.academicYear === year.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    >
                      <span
                        className={`text-sm font-bold ${filters.academicYear === year.id ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'}`}
                      >
                        {year.year}
                      </span>
                      {filters.academicYear === year.id && (
                        <Tick01Icon className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Semester FilterIcon */}
      {availableSemesters.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'semester' ? null : 'semester')}
            className={`flex items-center gap-2 px-5 py-3 rounded-[16px] text-sm font-semibold transition-all shadow-sm ${activeDropdown === 'semester' ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
          >
            <Layers01Icon
              className={`w-4 h-4 ${activeDropdown === 'semester' ? 'text-indigo-200' : 'text-slate-400'}`}
            />
            {selectedSemesterObj?.name || 'Select Semester'}
            <ArrowDown01Icon
              className={`w-4 h-4 transition-transform ${activeDropdown === 'semester' ? 'rotate-180 text-white' : 'text-slate-400'}`}
            />
          </button>

          <AnimatePresence>
            {activeDropdown === 'semester' && (
              <motion.div
                variants={dropdownVariants as any}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-3 w-48 bg-white/90 backdrop-blur-2xl rounded-[20px] border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-2 z-50 overflow-hidden"
              >
                <div className="space-y-1">
                  {availableSemesters.map((sem: any) => (
                    <button
                      key={sem.id}
                      onClick={() => updateFilter('semester', sem.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-colors text-left group ${filters.semester === sem.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    >
                      <span
                        className={`text-sm font-bold ${filters.semester === sem.id ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'}`}
                      >
                        {sem.name}
                      </span>
                      {filters.semester === sem.id && <Tick01Icon className="w-4 h-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Week FilterIcon */}
      {availableWeeks.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'week' ? null : 'week')}
            className={`flex items-center gap-2 px-5 py-3 rounded-[16px] text-sm font-semibold transition-all shadow-sm ${activeDropdown === 'week' ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
          >
            <Calendar01Icon
              className={`w-4 h-4 ${activeDropdown === 'week' ? 'text-indigo-200' : 'text-slate-400'}`}
            />
            {filters.week === 'ALL' ? 'All Weeks' : `Week ${filters.week}`}
            <ArrowDown01Icon
              className={`w-4 h-4 transition-transform ${activeDropdown === 'week' ? 'rotate-180 text-white' : 'text-slate-400'}`}
            />
          </button>

          <AnimatePresence>
            {activeDropdown === 'week' && (
              <motion.div
                variants={dropdownVariants as any}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute top-full left-0 mt-3 w-48 bg-white/90 backdrop-blur-2xl rounded-[20px] border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-2 z-50 overflow-hidden max-h-[300px] overflow-y-auto"
              >
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter('week', 'ALL')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-colors text-left group ${filters.week === 'ALL' ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <span
                      className={`text-sm font-bold ${filters.week === 'ALL' ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'}`}
                    >
                      All Weeks
                    </span>
                    {filters.week === 'ALL' && <Tick01Icon className="w-4 h-4 text-indigo-600" />}
                  </button>

                  {availableWeeks.map((week: any) => (
                    <button
                      key={week.weekNumber}
                      onClick={() => updateFilter('week', week.weekNumber.toString())}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-colors text-left group ${filters.week === week.weekNumber.toString() ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    >
                      <span
                        className={`text-sm font-bold ${filters.week === week.weekNumber.toString() ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'}`}
                      >
                        Week {week.weekNumber}
                      </span>
                      {filters.week === week.weekNumber.toString() && (
                        <Tick01Icon className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Event Type FilterIcon */}
      <div className="relative ml-auto">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
          className={`flex items-center gap-2 px-5 py-3 rounded-[16px] text-sm font-semibold transition-all shadow-sm ${activeDropdown === 'type' ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}
        >
          <FilterIcon
            className={`w-4 h-4 ${activeDropdown === 'type' ? 'text-indigo-200' : 'text-slate-400'}`}
          />
          {EVENT_TYPES.find((t) => t.value === filters.eventType)?.label}
          <ArrowDown01Icon
            className={`w-4 h-4 transition-transform ${activeDropdown === 'type' ? 'rotate-180 text-white' : 'text-slate-400'}`}
          />
        </button>

        <AnimatePresence>
          {activeDropdown === 'type' && (
            <motion.div
              variants={dropdownVariants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full right-0 mt-3 w-56 bg-white/90 backdrop-blur-2xl rounded-[20px] border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-2 z-50 overflow-hidden"
            >
              <div className="space-y-1">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateFilter('eventType', type.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-colors text-left group ${filters.eventType === type.value ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${type.color}`}></div>
                      <span
                        className={`text-sm font-bold ${filters.eventType === type.value ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'}`}
                      >
                        {type.label}
                      </span>
                    </div>
                    {filters.eventType === type.value && (
                      <Tick01Icon className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
