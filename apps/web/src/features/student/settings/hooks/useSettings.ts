import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
 getSettings,
 updateProfilePreferences,
 updatePrivacy,
 updateCalendar,
 updateRegional,
 updateNotifications,
 getDevices,
 deleteDevice,
 submitSupportRequest,
 requestDeactivation,
 exportData,
} from '../services/settings.service';

export const useSettings = () => {
 return useQuery({
 queryKey: ['student-settings'],
 queryFn: getSettings,
 staleTime: 5 * 60 * 1000,
 });
};

export const useUpdatePreferences = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: updateProfilePreferences,
 onSuccess: () => {
 toast.success('Preferences updated successfully');
 queryClient.invalidateQueries({ queryKey: ['student-settings'] });
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to update preferences');
 },
 });
};

export const useUpdatePrivacy = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: updatePrivacy,
 onSuccess: () => {
 toast.success('Privacy settings updated');
 queryClient.invalidateQueries({ queryKey: ['student-settings'] });
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to update privacy settings');
 },
 });
};

export const useUpdateCalendar = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: updateCalendar,
 onSuccess: () => {
 toast.success('Calendar settings updated');
 queryClient.invalidateQueries({ queryKey: ['student-settings'] });
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to update calendar settings');
 },
 });
};

export const useUpdateRegional = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: updateRegional,
 onSuccess: () => {
 toast.success('Regional settings updated');
 queryClient.invalidateQueries({ queryKey: ['student-settings'] });
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to update regional settings');
 },
 });
};

export const useUpdateNotifications = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: updateNotifications,
 onSuccess: () => {
 toast.success('Notification settings updated');
 queryClient.invalidateQueries({ queryKey: ['student-settings'] });
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to update notification settings');
 },
 });
};

export const useDevices = () => {
 return useQuery({
 queryKey: ['student-devices'],
 queryFn: getDevices,
 staleTime: 5 * 60 * 1000,
 });
};

export const useDeleteDevice = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: deleteDevice,
 onSuccess: () => {
 toast.success('Device removed successfully');
 queryClient.invalidateQueries({ queryKey: ['student-devices'] });
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to remove device');
 },
 });
};

export const useSubmitSupportRequest = () => {
 return useMutation({
 mutationFn: submitSupportRequest,
 onSuccess: (data) => {
 toast.success(data.message);
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to submit support request');
 },
 });
};

export const useRequestDeactivation = () => {
 return useMutation({
 mutationFn: requestDeactivation,
 onSuccess: (data) => {
 toast.success(data.message);
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to request deactivation');
 },
 });
};

export const useExportData = () => {
 return useMutation({
 mutationFn: exportData,
 onSuccess: (data) => {
 // Create a blob and download
 const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `placementx-data-export-${new Date().toISOString().split('T')[0]}.json`;
 a.click();
 window.URL.revokeObjectURL(url);
 toast.success('Data export generated and downloaded successfully');
 },
 onError: (error: any) => {
 toast.error(error.response?.data?.error || 'Failed to export data');
 },
 });
};
