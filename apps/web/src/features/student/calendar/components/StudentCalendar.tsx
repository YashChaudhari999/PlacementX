import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { motion } from 'framer-motion';
import { Calendar01Icon } from 'hugeicons-react';

import { useStudentCalendar } from '../hooks/useStudentCalendar';
import { UpcomingEvents } from './UpcomingEvents';
import { CalendarEventDetails } from './CalendarEventDetails';
import type { CalendarEvent } from '../types/calendar.types';
import { EmptyState, LoadingState } from '@/components/ui/feedback';
import { Button } from '@/components/ui';

export default function StudentCalendar() {
 const calendarRef = useRef<FullCalendar>(null);

 // State
 const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

 // Queries
 const { data, isPending, error } = useStudentCalendar();

 if (error) {
 return (
 <div className="h-[70vh] flex flex-col justify-center">
 <EmptyState
 icon={<Calendar01Icon className="w-12 h-12 text-muted-foreground"/>}
 title="Failed to Load Schedule"
 description="We couldn't retrieve your placement calendar. Please check your connection and try again."
 action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
 />
 </div>
 );
 }

 // Handle Event Click
 const handleEventClick = (clickInfo: any) => {
 setSelectedEvent(clickInfo.event);
 };

 return (
 <div className="max-w-[1600px] mx-auto pb-12 relative h-full">
 {/* Decorative Background Gradients */}
 <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4"
 >
 <div>
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/20">
 <Calendar01Icon className="w-6 h-6 stroke-[1.5]"/>
 </div>
 <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
 Placement Calendar
 </h1>
 </div>
 <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
 Track your application deadlines, upcoming drives, and interview schedules all in one
 place.
 </p>
 </div>
 </motion.div>

 {/* Main Layout Grid */}
 <div className="flex flex-col xl:flex-row gap-8 items-start">
 {/* Sidebar - Upcoming Events */}
 <motion.div
 initial={{ opacity: 0, x: -30 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.1 }}
 className="w-full xl:w-[340px] shrink-0"
 >
 <UpcomingEvents events={data?.events || []} onEventClick={(e) => setSelectedEvent(e)} />
 </motion.div>

 {/* Calendar Core area */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="flex-1 w-full min-w-0 flex flex-col gap-6"
 >
 <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border shadow-sm p-4 sm:p-6 md:p-8 min-h-[600px] xl:h-[850px] calendar-wrapper relative overflow-hidden group/calendar">
 {isPending && (
 <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-3xl">
 <LoadingState message="Syncing your schedule..."/>
 </div>
 )}

 <style>{`
 .fc { font-family: 'Inter', sans-serif; }
 .fc-theme-standard td, .fc-theme-standard th { border-color: hsl(var(--border)/0.25); }
 .fc-theme-standard .fc-scrollgrid { border-color: transparent; border: 0 !important; overflow: hidden; box-shadow: none !important; }
 
 /* Remove outer borders of the grid to make it flush */
 .fc-theme-standard td:first-child, .fc-theme-standard th:first-child { border-left: 0 !important; }
 .fc-theme-standard td:last-child, .fc-theme-standard th:last-child { border-right: 0 !important; }
 .fc-scrollgrid-section-header th { border-top: 0 !important; }
 .fc-scrollgrid-section-body:last-child td { border-bottom: 0 !important; }

 .fc-header-toolbar { padding: 0.5rem 0; margin-bottom: 2rem !important; flex-wrap: wrap; gap: 1rem; }
 .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 800; color: hsl(var(--foreground)); letter-spacing: -0.02em; }
 @media (min-width: 640px) {
 .fc-toolbar-title { font-size: 1.5rem !important; }
 }
 
 .fc-button-group {
 box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
 border-radius: 0.5rem;
 overflow: hidden;
 }
 .fc-button-primary { 
 background-color: hsl(var(--background)) !important; 
 border: 1px solid hsl(var(--border)) !important; 
 color: hsl(var(--muted-foreground)) !important;
 font-weight: 500 !important; 
 text-transform: capitalize !important;
 padding: 0.5rem 0.875rem !important;
 transition: all 0.2s ease !important;
 font-size: 0.875rem !important;
 }
 .fc-button-primary:hover {
 background-color: hsl(var(--muted)/0.5) !important;
 color: hsl(var(--foreground)) !important;
 }
 .fc-button-primary:not(:disabled):active, .fc-button-primary:not(:disabled).fc-button-active {
 background-color: hsl(var(--primary)) !important; 
 border-color: hsl(var(--primary)) !important;
 color: hsl(var(--primary-foreground)) !important;
 }
 .fc-today-button {
 background-color: hsl(var(--muted)/0.5) !important;
 border-radius: 0.5rem !important;
 margin-left: 0.75rem !important;
 font-weight: 600 !important;
 color: hsl(var(--foreground)) !important;
 }
 
 .fc-day-today { background-color: hsl(var(--primary)/0.02) !important; }
 .fc-day-today .fc-daygrid-day-number {
 background-color: hsl(var(--primary));
 color: hsl(var(--primary-foreground)) !important;
 border-radius: 9999px;
 width: 28px;
 height: 28px;
 display: flex;
 align-items: center;
 justify-content: center;
 margin: 8px;
 box-shadow: 0 2px 4px -1px hsl(var(--primary)/0.4);
 }
 
 .fc-event { 
 border-radius: 4px; 
 padding: 3px 6px; 
 font-size: 0.75rem; 
 font-weight: 600; 
 cursor: pointer; 
 transition: all 0.2s ease; 
 margin: 2px 6px !important;
 border: none !important;
 border-left: 3px solid var(--fc-event-bg-color, hsl(var(--primary))) !important;
 background-color: hsl(var(--muted)/0.5) !important;
 color: hsl(var(--foreground)) !important;
 }
 .fc-event-main {
 padding: 2px 4px;
 text-overflow: ellipsis;
 white-space: nowrap;
 overflow: hidden;
 }
 .fc-event:hover { 
 transform: translateY(-1px); 
 box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
 z-index: 50 !important;
 background-color: hsl(var(--muted)) !important;
 }
 
 .fc-col-header-cell-cushion { 
 padding: 16px 4px !important; 
 color: hsl(var(--muted-foreground)); 
 font-weight: 600; 
 text-transform: uppercase; 
 font-size: 0.7rem; 
 letter-spacing: 0.05em;
 }
 .fc-daygrid-day-number { 
 color: hsl(var(--muted-foreground)); 
 font-weight: 500; 
 font-size: 0.85rem;
 padding: 12px !important; 
 text-decoration: none !important; 
 }
 
 /* Mobile specific overrides */
 @media (max-width: 640px) {
 .fc-header-toolbar { flex-direction: column; align-items: flex-start; }
 .fc-toolbar-chunk { width: 100%; display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
 .fc-toolbar-chunk:last-child { justify-content: flex-start; }
 .fc-button { padding: 0.4rem 0.6rem !important; font-size: 0.75rem !important; }
 }
 `}</style>
 <FullCalendar
 ref={calendarRef}
 plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
 initialView={window.innerWidth < 768 ? 'listWeek' : 'dayGridMonth'}
 headerToolbar={{
 left: 'prev,next today',
 center: 'title',
 right:
 window.innerWidth < 768
 ? 'listWeek,timeGridDay'
 : 'dayGridMonth,timeGridWeek,listWeek',
 }}
 events={data?.events || []}
 eventClick={handleEventClick}
 editable={false} // Students cannot drag and drop to reschedule
 height="100%"
 dayMaxEvents={3}
 nowIndicator={true}
 eventDisplay="block"
 eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
 />
 </div>
 </motion.div>
 </div>

 {/* Modals */}
 <CalendarEventDetails
 event={selectedEvent}
 isOpen={!!selectedEvent}
 onClose={() => setSelectedEvent(null)}
 />
 </div>
 );
}
