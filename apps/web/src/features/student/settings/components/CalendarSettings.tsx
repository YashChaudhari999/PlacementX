import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useSettings, useUpdateCalendar } from '../hooks/useSettings';
import { SettingsSkeleton } from '@/components/common/Skeletons';

export default function CalendarSettings() {
 const { data, isLoading } = useSettings();
 const { mutate: updateCal, isPending } = useUpdateCalendar();

 const [formData, setFormData] = useState({
 defaultCalendarView: 'month',
 interviewReminders: '',
 deadlineReminders: '',
 });

 useEffect(() => {
 if (data?.preferences) {
 setFormData({
 defaultCalendarView: data.preferences.defaultCalendarView || 'month',
 interviewReminders: Array.isArray(data.preferences.interviewReminders)
 ? data.preferences.interviewReminders.join(', ')
 : '',
 deadlineReminders: Array.isArray(data.preferences.deadlineReminders)
 ? data.preferences.deadlineReminders.join(', ')
 : '',
 });
 }
 }, [data]);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 updateCal({
 defaultCalendarView: formData.defaultCalendarView,
 interviewReminders: formData.interviewReminders
 .split(',')
 .map((s) => s.trim())
 .filter(Boolean),
 deadlineReminders: formData.deadlineReminders
 .split(',')
 .map((s) => s.trim())
 .filter(Boolean),
 });
 };

 if (isLoading) return <SettingsSkeleton />;

 return (
 <Card className="p-6 border border-border/60 shadow-lg shadow-slate-200/40 bg-card/90 backdrop-blur-xl">
 <h3 className="font-bold text-foreground text-lg border-b border-border pb-4 mb-6">
 Calendar & Reminders
 </h3>
 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Default Calendar View</label>
 <select
 value={formData.defaultCalendarView}
 onChange={(e) => setFormData({ ...formData, defaultCalendarView: e.target.value })}
 className="w-full h-10 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
 >
 <option value="month">Month</option>
 <option value="week">Week</option>
 <option value="list">List</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium text-foreground">
 Interview Reminders (comma separated)
 </label>
 <p className="text-xs text-muted-foreground mb-2">e.g."1 day before","1 hour before"</p>
 <Input
 value={formData.interviewReminders}
 onChange={(e) => setFormData({ ...formData, interviewReminders: e.target.value })}
 placeholder="1 day before, 1 hour before"
 />
 </div>

 <div className="space-y-1">
 <label className="text-sm font-medium text-foreground">
 Application Deadline Reminders (comma separated)
 </label>
 <Input
 value={formData.deadlineReminders}
 onChange={(e) => setFormData({ ...formData, deadlineReminders: e.target.value })}
 placeholder="24 hours before, 3 days before"
 />
 </div>

 <div className="pt-4 flex justify-end">
 <Button type="submit"disabled={isPending}>
 {isPending ? 'Saving...' : 'Save Preferences'}
 </Button>
 </div>
 </form>
 </Card>
 );
}
