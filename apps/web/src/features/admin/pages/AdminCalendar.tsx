import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, MapPin, Building2, AlertCircle } from 'lucide-react';

export default function AdminCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/calendar');
      
      // Sort by date ascending
      const sortedEvents = res.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Filter out past events
      const futureEvents = sortedEvents.filter((e: any) => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0));
      
      setEvents(futureEvents);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading Calendar...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Placement Calendar</h1>
          <p className="text-slate-500">Upcoming company visits, assessment tests, and application deadlines.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-medium text-slate-700">No Upcoming Events</h3>
            <p className="text-slate-500 mt-2">The placement calendar is currently clear.</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {events.map((event, idx) => {
              const isDeadline = event.type === 'DEADLINE';
              const dateObj = new Date(event.date);
              
              return (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                    isDeadline ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                  }`}>
                    {isDeadline ? <AlertCircle className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isDeadline ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-slate-800 mb-3">{event.title}</h4>
                    
                    {!isDeadline && (
                      <div className="space-y-2 text-sm text-slate-600">
                        {event.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" /> {event.time}
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" /> {event.venue}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
