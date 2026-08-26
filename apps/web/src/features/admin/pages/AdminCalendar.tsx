import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import CalendarSidebar from '../components/calendar/CalendarSidebar';
import CalendarFilters from '../components/calendar/CalendarFilters';
import EventDetailsModal from '../components/calendar/EventDetailsModal';
import CreateEventModal from '../components/calendar/CreateEventModal';
import { AnalyticsSkeleton } from '@/components/common/Skeletons';

import {
  useAdminCalendar,
  useUpdateCustomEvent,
  useRescheduleInterview,
} from '@/hooks/queries/useAdminCalendar';

export default function AdminCalendar() {
  const calendarRef = useRef<FullCalendar>(null);

  // State
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<Date | null>(null);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  const [activeFilters, setActiveFilters] = useState<any>({
    academicYear: '2026-2027',
    semester: 'semester7',
    week: 'ALL',
    eventType: 'ALL',
  });

  // Queries & Mutations
  const { data, isPending, error } = useAdminCalendar();
  const updateCustomEvent = useUpdateCustomEvent();
  const rescheduleInterview = useRescheduleInterview();

  if (error) {
    toast.error('Failed to load calendar events');
  }

  // Handle Event Click
  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
  };

  // Handle Date Click (create new event)
  const handleDateClick = (arg: any) => {
    setSelectedDateForCreate(arg.date);
    setEventToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setEventToEdit(event);
    setSelectedDateForCreate(null);
    setIsCreateModalOpen(true);
  };

  // Handle Drag & Drop / Resize
  const handleEventChange = (changeInfo: any) => {
    const { event } = changeInfo;
    const isCustom = event.extendedProps?.isCustom;
    const type = event.extendedProps?.type;

    if (isCustom) {
      updateCustomEvent.mutate({
        id: event.extendedProps.eventId,
        start: event.startStr,
        end: event.endStr || event.startStr,
        isAllDay: event.allDay,
      });
    } else if (type === 'Interview Schedule') {
      const date = event.startStr.split('T')[0];
      const time = event.startStr.includes('T')
        ? event.startStr.split('T')[1].substring(0, 5)
        : undefined;

      const interviewId = event.id.replace('round-', '');
      rescheduleInterview.mutate({ id: interviewId, date, time });
    } else {
      changeInfo.revert();
      toast.error('Only custom events and interviews can be rescheduled via drag-and-drop.');
    }
  };

  // Handle Mini Calendar Date Selection
  const handleDateSelect = (date: Date) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(date);
    }
  };

  // Handle Filter Change
  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);

    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && filters.weekDates) {
      calendarApi.gotoDate(filters.weekDates.start);
      calendarApi.changeView('timeGridWeek');
    }
  };

  // Filter Events Logic
  const getFilteredEvents = () => {
    if (!data?.events) return [];

    let filtered = [...data.events];

    // Week Filter
    if (activeFilters.weekDates) {
      const weekStart = new Date(activeFilters.weekDates.start);
      const weekEnd = new Date(activeFilters.weekDates.end);
      filtered = filtered.filter((e) => {
        const eventStart = new Date(e.start);
        return eventStart >= weekStart && eventStart <= weekEnd;
      });
    }

    // Event Type Filter
    if (activeFilters.eventType !== 'ALL') {
      filtered = filtered.filter((e) => e.extendedProps?.type === activeFilters.eventType);
    }

    return filtered;
  };

  if (isPending && !data) return <AnalyticsSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto pb-12 relative">
      {/* Decorative Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Placement Calendar
            </h1>
          </div>
          <p className="text-slate-500 text-base max-w-2xl">
            Orchestrate placement drives, track academic schedules, and manage interviews
            effortlessly with this interactive command center.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Live Sync Active
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedDateForCreate(new Date());
              setEventToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="group relative overflow-hidden bg-slate-900 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient"></div>
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">New Event</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Layout Grid */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full xl:w-[340px] shrink-0"
        >
          <CalendarSidebar
            events={data?.events || []}
            summary={data?.summary}
            onDateSelect={handleDateSelect}
          />
        </motion.div>

        {/* Calendar Core area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 w-full min-w-0 flex flex-col gap-6"
        >
          <CalendarFilters
            semesterConfig={data?.semester}
            fullConfig={data?.config}
            onFilterChange={handleFilterChange}
          />

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 h-[850px] calendar-wrapper relative overflow-hidden group/calendar">
            {/* Inner decorative glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[80px] -mr-40 -mt-40 transition-opacity duration-700 opacity-50 group-hover/calendar:opacity-100 pointer-events-none"></div>

            <style>{`
                .fc { font-family: 'Inter', sans-serif; }
                .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
                .fc-theme-standard .fc-scrollgrid { border-color: transparent; border-radius: 1rem; overflow: hidden; box-shadow: 0 0 0 1px #f1f5f9; }
                .fc-header-toolbar { padding: 0.5rem 0; margin-bottom: 2rem !important; }
                .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
                
                .fc-button-group {
                  box-shadow: 0 2px 5px -1px rgb(0 0 0 / 0.05);
                  border-radius: 0.75rem;
                  overflow: hidden;
                }
                .fc-button-primary { 
                  background-color: #fff !important; 
                  border: 1px solid #e2e8f0 !important; 
                  color: #64748b !important;
                  font-weight: 600 !important; 
                  text-transform: capitalize !important;
                  padding: 0.5rem 1rem !important;
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .fc-button-primary:hover {
                  background-color: #f8fafc !important;
                  color: #0f172a !important;
                }
                .fc-button-primary:not(:disabled):active, .fc-button-primary:not(:disabled).fc-button-active {
                  background-color: #0f172a !important; 
                  border-color: #0f172a !important;
                  color: white !important;
                }
                .fc-today-button {
                  background-color: #f8fafc !important;
                  border-radius: 0.75rem !important;
                  margin-left: 1rem !important;
                  box-shadow: 0 2px 5px -1px rgb(0 0 0 / 0.05);
                }
                
                .fc-day-today { background-color: #f8fafc !important; }
                .fc-day-today .fc-daygrid-day-number {
                  background-color: #4f46e5;
                  color: white !important;
                  border-radius: 100%;
                  width: 28px;
                  height: 28px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 4px;
                }
                
                .fc-event { 
                  border-radius: 6px; 
                  padding: 2px 4px; 
                  font-size: 0.75rem; 
                  font-weight: 600; 
                  cursor: pointer; 
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
                  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                  margin: 2px 4px !important;
                  border-width: 1px !important;
                  border-left-width: 4px !important;
                  border-style: solid !important;
                }
                .fc-event-main {
                  padding: 2px 4px;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  overflow: hidden;
                }
                .fc-event:hover { 
                  transform: scale(1.02) translateY(-2px); 
                  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                  z-index: 50 !important;
                  filter: brightness(1.05);
                }
                
                .fc-col-header-cell-cushion { padding: 16px 8px !important; color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
                .fc-daygrid-day-number { color: #475569; font-weight: 600; padding: 12px !important; text-decoration: none !important; }
                .fc-daygrid-day-top { flex-direction: row; }
             `}</style>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
              }}
              events={getFilteredEvents()}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              editable={true}
              eventDrop={handleEventChange}
              eventResize={handleEventChange}
              height="100%"
              dayMaxEvents={4}
              nowIndicator={true}
              eventDisplay="block"
              eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
        />
      )}

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEventToEdit(null);
        }}
        selectedDate={selectedDateForCreate}
        editEvent={eventToEdit}
      />
    </div>
  );
}
