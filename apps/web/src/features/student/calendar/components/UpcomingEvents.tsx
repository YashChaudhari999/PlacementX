import React from 'react';
import { format, isAfter, isToday, isTomorrow } from 'date-fns';
import type { CalendarEvent } from '../types/calendar.types';
import { Calendar, Clock, MapPin, Briefcase, CalendarClock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { EmptyState } from '@/components/ui/feedback';
import { motion } from 'framer-motion';

interface UpcomingEventsProps {
 events: CalendarEvent[];
 onEventClick: (event: CalendarEvent) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, onEventClick }) => {
 const now = new Date();

 const upcoming = events
 .filter((e) => e.start && isAfter(new Date(e.start), now))
 .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
 .slice(0, 5);

 const formatEventTime = (dateStr: string) => {
 const date = new Date(dateStr);
 if (isToday(date)) return `TODAY, ${format(date, 'h:mm a')}`;
 if (isTomorrow(date)) return `TOMORROW, ${format(date, 'h:mm a')}`;
 return format(date, 'MMM d, h:mm a');
 };

 const getStatusBadge = (event: CalendarEvent) => {
 const type = event.extendedProps?.type || 'Event';
 if (type.includes('Deadline')) return <Badge variant="warning">{type}</Badge>;
 if (type.includes('Drive'))
 return (
 <Badge variant="default"className="bg-primary">
 {type}
 </Badge>
 );
 if (type.includes('Interview') || type.includes('Round'))
 return (
 <Badge variant="success"className="bg-success text-success-foreground">
 {type}
 </Badge>
 );
 return <Badge variant="secondary">{type}</Badge>;
 };

 return (
 <Card className="h-full border-border/50 bg-card">
 <CardHeader className="pb-3 border-b border-border/30">
 <CardTitle className="text-lg font-semibold flex items-center gap-2">
 <Calendar className="h-5 w-5 text-primary"/>
 Upcoming Events
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-4 px-3">
 {upcoming.length === 0 ? (
 <div className="py-6">
 <EmptyState
 icon={<CalendarClock className="w-12 h-12"/>}
 title="No Upcoming Events"
 description="Your placement schedule is clear for now."
 className="border-0 shadow-none bg-transparent"
 />
 </div>
 ) : (
 <div className="space-y-3">
 {upcoming.map((event, index) => (
 <motion.div
 key={event.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 onClick={() => onEventClick(event)}
 className="group p-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted/30 hover:border-border cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
 >
 <div className="flex justify-between items-start mb-2.5">
 <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
 <Clock className="h-3.5 w-3.5"/>
 {formatEventTime(event.start)}
 </span>
 {getStatusBadge(event)}
 </div>

 <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-2">
 {event.title}
 </h4>

 <div className="flex flex-col gap-1.5 mt-2">
 {event.extendedProps?.company && (
 <p className="text-xs text-muted-foreground flex items-center gap-1.5">
 <Briefcase className="h-3.5 w-3.5 opacity-70"/>
 {event.extendedProps.company}
 </p>
 )}

 {event.extendedProps?.venue && (
 <p className="text-xs text-muted-foreground flex items-center gap-1.5">
 <MapPin className="h-3.5 w-3.5 opacity-70"/>
 {event.extendedProps.venue}
 </p>
 )}
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 );
};
