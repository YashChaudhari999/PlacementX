import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  jobCategories: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  workMode: z.array(z.string()).optional(),
  salaryRange: z.string().optional(),
  confirmBeforeApply: z.boolean().optional(),
});

export const updatePrivacySchema = z.object({
  profileVisibility: z.enum(['PUBLIC', 'RECRUITER_ONLY', 'PRIVATE']).optional(),
  resumeVisibility: z.enum(['PUBLIC', 'RECRUITER_ONLY', 'PRIVATE']).optional(),
});

export const updateCalendarSchema = z.object({
  defaultCalendarView: z.enum(['month', 'week', 'list']).optional(),
  interviewReminders: z.array(z.string()).optional(),
  deadlineReminders: z.array(z.string()).optional(),
});

export const updateRegionalSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).optional(),
  compactMode: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  timeFormat: z.enum(['12-hour', '24-hour']).optional(),
});

export const updateNotificationSchema = z.object({
  placement: z.boolean().optional(),
  interviews: z.boolean().optional(),
  meetings: z.boolean().optional(),
  messages: z.boolean().optional(),
  assignments: z.boolean().optional(),
  marketing: z.boolean().optional(),
  promotions: z.boolean().optional(),
  system: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().nullable().optional(),
  quietHoursEnd: z.string().nullable().optional(),
});

export const helpSupportSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  attachment: z.any().optional(),
});
