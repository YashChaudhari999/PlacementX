import { useState } from 'react';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {
  Calendar01Icon,
  Briefcase01Icon,
  UserMultipleIcon,
  Note01Icon,
  ArrowRight01Icon,
  Notification01Icon,
  Alert02Icon,
  SparklesIcon,
} from 'hugeicons-react';
import { Link } from 'react-router-dom';
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';

interface CalendarSidebarProps {
  events: any[];
  summary: any;
  onDateSelect: (date: Date) => void;
}

export default function CalendarSidebar({ events, summary, onDateSelect }: CalendarSidebarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  const now = new Date();
  const next7Days = addDays(now, 7);

  // Upcoming Events (Next 5 events)
  const upcomingEvents = events
    .filter((e) => isAfter(new Date(e.start), now))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  // Deadlines closing in the next 7 days
  const upcomingDeadlines = events
    .filter(
      (e) =>
        e.extendedProps?.type === 'Deadline' &&
        isAfter(new Date(e.start), now) &&
        isBefore(new Date(e.start), next7Days)
    )
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="w-full xl:w-[340px] space-y-6 shrink-0 relative">
      {/* Decorative Blur behind sidebar */}
      <div className="absolute top-1/4 left-0 w-full h-[300px] bg-indigo-500/5 rounded-full blur-[60px] -z-10 pointer-events-none"></div>

      {/* Mini Calendar */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-2xl rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 overflow-hidden relative group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <style>{`
          .rdp { margin: 0; --rdp-cell-size: 40px; --rdp-accent-color: #4f46e5; --rdp-background-color: #eef2ff; font-family: 'Inter', sans-serif; }
          .rdp-day_today { font-weight: 800; color: #4f46e5; }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f8fafc; border-radius: 12px; }
          .rdp-head_cell { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
          .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
            background-color: #4f46e5;
            color: white;
            font-weight: bold;
            border-radius: 12px;
            box-shadow: 0 4px 14px 0 rgb(79,70,229,0.39);
          }
          .rdp-day {
            border-radius: 12px;
            transition: all 0.2s ease;
          }
        `}</style>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="mx-auto flex justify-center text-sm font-semibold text-slate-700 relative z-10"
          showOutsideDays
        />
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-2xl rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6"
      >
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-amber-500" /> Quick Snapshot
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[16px] p-4 border border-indigo-100/50 shadow-sm hover:shadow-md transition-shadow group">
            <div className="text-3xl font-black text-indigo-600 tracking-tight group-hover:scale-105 transition-transform origin-left">
              {summary?.upcomingDrives || 0}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide">
              Drives
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-[16px] p-4 border border-emerald-100/50 shadow-sm hover:shadow-md transition-shadow group">
            <div className="text-3xl font-black text-emerald-600 tracking-tight group-hover:scale-105 transition-transform origin-left">
              {summary?.upcomingInterviews || 0}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide">
              Interviews
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Events List */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-2xl rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Notification01Icon className="w-4 h-4 text-indigo-500" /> Upcoming
          </h3>
          <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-wider">
            Next 5
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No upcoming events
            </div>
          ) : (
            upcomingEvents.map((event, idx) => {
              const isDrive = event.extendedProps?.type === 'Placement Drive';
              const isInterview = event.extendedProps?.type === 'Interview Schedule';

              let Icon = Calendar01Icon;
              if (isDrive) Icon = Briefcase01Icon;
              if (isInterview) Icon = UserMultipleIcon;

              return (
                <motion.div
                  key={event.id || idx}
                  variants={itemVariants}
                  className="group flex gap-4 p-3 -mx-3 rounded-[16px] hover:bg-slate-50/80 transition-all cursor-pointer relative overflow-hidden hover:shadow-sm"
                >
                  <div
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${event.backgroundColor || '#4f46e5'}15`,
                      color: event.backgroundColor || '#4f46e5',
                      borderColor: `${event.backgroundColor || '#4f46e5'}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      {format(new Date(event.start), 'dd/MM/yyyy, h:mm a')}
                    </div>
                  </div>
                  {event.extendedProps?.driveId && (
                    <Link
                      to={`/admin/placement-events/${event.extendedProps.driveId}`}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                    >
                      <ArrowRight01Icon className="w-4 h-4" />
                    </Link>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>

      {/* Deadlines closing soon */}
      {upcomingDeadlines.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-rose-500 to-red-600 rounded-[24px] shadow-lg shadow-red-500/20 p-6 text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

          <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-5 flex items-center gap-2 relative z-10">
            <Alert02Icon className="w-4 h-4" /> Deadlines Closing Soon
          </h3>

          <div className="space-y-4 relative z-10">
            {upcomingDeadlines.map((deadline, idx) => (
              <div
                key={idx}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-[16px] transition-colors cursor-pointer border border-white/10"
              >
                <h4 className="text-sm font-bold line-clamp-1">{deadline.title}</h4>
                <div className="text-xs font-semibold text-red-100 mt-1.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-200 animate-pulse"></div>
                  Closes {format(new Date(deadline.start), 'dd/MM/yyyy')}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
