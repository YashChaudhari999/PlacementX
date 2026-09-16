import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStudentCalendar } from '../services/calendar.service';
import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export const useStudentCalendar = (start?: string, end?: string) => {
 const queryClient = useQueryClient();

 const query = useQuery({
 queryKey: ['student-calendar', start, end],
 queryFn: () => getStudentCalendar(start, end),
 staleTime: 5 * 60 * 1000, // 5 minutes
 });

 useEffect(() => {
 // We assume the token is automatically managed or we could retrieve it from auth store if needed
 const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
 let socket: Socket | null = null;

 try {
 socket = io(socketUrl, {
 withCredentials: true,
 });

 const handleUpdate = () => {
 // Invalidate the calendar query to refetch data
 queryClient.invalidateQueries({ queryKey: ['student-calendar'] });
 };

 // Listen for placement events from the server
 socket.on('interview_created', handleUpdate);
 socket.on('interview_rescheduled', handleUpdate);
 socket.on('interview_cancelled', handleUpdate);
 socket.on('selection_round_created', handleUpdate);
 socket.on('selection_round_changed', handleUpdate);
 socket.on('drive_date_changed', handleUpdate);
 socket.on('application_deadline_changed', handleUpdate);
 socket.on('notification_received', handleUpdate); // generic fallback
 } catch (e) {
 console.error('Socket connection failed for calendar', e);
 }

 return () => {
 if (socket) {
 socket.disconnect();
 }
 };
 }, [queryClient]);

 return query;
};
