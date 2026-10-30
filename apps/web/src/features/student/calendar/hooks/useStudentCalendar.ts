import { useQuery } from '@tanstack/react-query';
import { getStudentCalendar } from '../services/calendar.service';

export const useStudentCalendar = (start?: string, end?: string) => {
 const query = useQuery({
 queryKey: ['student-calendar', start, end],
 queryFn: () => getStudentCalendar(start, end),
 staleTime: 5 * 60 * 1000, // 5 minutes
 });

 return query;
};
