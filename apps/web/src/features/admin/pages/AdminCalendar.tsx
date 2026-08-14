import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

import CalendarSidebar from '../components/calendar/CalendarSidebar';
import CalendarFilters from '../components/calendar/CalendarFilters';
import EventDetailsModal from '../components/calendar/EventDetailsModal';
import { AnalyticsSkeleton } from '@/components/common/Skeletons'; // Re-use skeleton

export default function AdminCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  
  // State
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<any>({
    academicYear: '2026-2027',
    semester: 'semester7',
    week: 'ALL',
    eventType: 'ALL'
  });

  // Fetch Calendar Data (Auto refresh every 60s)
  const { data, isPending, error } = useQuery({
    queryKey: ['admin-calendar'],
    queryFn: async () => {
      const res = await api.get('/admin/calendar');
      return res.data;
    },
    refetchInterval: 60000,
  });

  if (error) {
    toast.error('Failed to load calendar events');
  }

  // Handle Event Click
  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
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
      filtered = filtered.filter(e => {
        const eventStart = new Date(e.start);
        return eventStart >= weekStart && eventStart <= weekEnd;
      });
    }

    // Event Type Filter
    if (activeFilters.eventType !== 'ALL') {
      filtered = filtered.filter(e => e.extendedProps?.type === activeFilters.eventType);
    }

    return filtered;
  };

  if (isPending && !data) return <AnalyticsSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Placement Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">Manage placement drives, academic schedules, and interviews.</p>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Sidebar */}
        <CalendarSidebar 
          events={data?.events || []} 
          summary={data?.summary} 
          onDateSelect={handleDateSelect} 
        />

        {/* Calendar Core area */}
        <div className="flex-1 w-full min-w-0">
          
          <CalendarFilters 
             semesterConfig={data?.semester} 
             onFilterChange={handleFilterChange} 
          />

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-[800px] calendar-wrapper">
             <style>{`
                .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
                .fc-theme-standard .fc-scrollgrid { border-color: #f1f5f9; }
                .fc-header-toolbar { padding: 0.5rem 0; margin-bottom: 1rem !important; }
                .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 700; color: #1e293b; }
                .fc-button-primary { background-color: #4f46e5 !important; border-color: #4f46e5 !important; font-weight: 600 !important; }
                .fc-button-primary:not(:disabled):active, .fc-button-primary:not(:disabled).fc-button-active {
                  background-color: #4338ca !important; border-color: #4338ca !important;
                }
                .fc-day-today { background-color: #f8fafc !important; }
                .fc-event { border: none !important; border-radius: 6px; padding: 2px 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: transform 0.1s; }
                .fc-event:hover { filter: brightness(0.95); transform: translateY(-1px); }
                .fc-col-header-cell-cushion { padding: 8px 4px !important; color: #64748b; font-weight: 600; }
                .fc-daygrid-day-number { color: #475569; font-weight: 500; padding: 8px !important; }
             `}</style>
             <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                }}
                events={getFilteredEvents()}
                eventClick={handleEventClick}
                height="100%"
                dayMaxEvents={3}
                nowIndicator={true}
                eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
             />
          </div>

        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

    </div>
  );
}
