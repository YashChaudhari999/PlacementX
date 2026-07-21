import { useState } from 'react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Calendar as CalendarIcon, Clock, Briefcase, AlertCircle } from 'lucide-react';
import 'react-day-picker/dist/style.css';

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
    .filter(e => isAfter(new Date(e.start), now))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  // Deadlines closing in the next 7 days
  const upcomingDeadlines = events
    .filter(e => e.extendedProps?.type === 'Deadline' && isAfter(new Date(e.start), now) && isBefore(new Date(e.start), next7Days))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="w-full xl:w-80 shrink-0 space-y-6">
      
      {/* 1. Mini Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden">
        <style>{`
          .rdp {
            --rdp-cell-size: 32px !important;
            --rdp-accent-color: #4f46e5;
            --rdp-background-color: #e0e7ff;
            margin: 0 !important;
          }
          .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
            background-color: #4f46e5;
            color: white;
          }
        `}</style>
        <DayPicker 
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          showOutsideDays
          className="w-full flex justify-center text-sm"
        />
      </div>

      {/* 2. Upcoming Events */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-500" />
          Upcoming Schedule
        </h3>
        {upcomingEvents.length === 0 ? (
           <p className="text-sm text-slate-500">No upcoming events.</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, idx) => (
              <div key={idx} className="flex gap-3 items-start group cursor-pointer">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: event.color }}></div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{event.title}</h4>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {format(new Date(event.start), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Deadlines */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          Closing Soon
        </h3>
        {upcomingDeadlines.length === 0 ? (
           <p className="text-sm text-slate-500">No deadlines in the next 7 days.</p>
        ) : (
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="bg-red-50 p-1.5 rounded text-red-500 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{deadline.title}</h4>
                  <div className="text-xs font-medium text-red-500 mt-0.5">
                    Closes {format(new Date(deadline.start), 'MMM d')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
