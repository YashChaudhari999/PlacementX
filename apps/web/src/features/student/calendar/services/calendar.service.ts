import api from '../../../../lib/api';
import type { CalendarResponse, CalendarEvent } from '../types/calendar.types';

export const getStudentCalendar = async (
 start?: string,
 end?: string
): Promise<CalendarResponse> => {
 const params: any = {};
 if (start) params.start = start;
 if (end) params.end = end;

 const response = await api.get('/student/calendar', { params });
 return response.data;
};

// Utility to download ICS
export const downloadIcs = (event: CalendarEvent) => {
 const formatIcsDate = (dateString?: string) => {
 if (!dateString) return '';
 const date = new Date(dateString);
 return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
 };

 const start = formatIcsDate(event.start);
 const end = formatIcsDate(event.end || event.start); // fallback to start if end not provided

 const props = event.extendedProps || {};
 const description =
 `${props.type || ''}\n${props.description || ''}\n${props.instructions || ''}`.trim();
 const location = props.venue || 'TBD';

 const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PlacementX//Student Calendar//EN
BEGIN:VEVENT
UID:${event.id}-${Date.now()}
DTSTAMP:${formatIcsDate(new Date().toISOString())}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

 const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
 const url = window.URL.createObjectURL(blob);

 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
};
