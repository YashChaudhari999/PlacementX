import { z } from 'zod';

/**
 * Zod validation schemas for analytics query parameters.
 * Used to validate and sanitize filter inputs on every analytics endpoint.
 */

export const analyticsFilterSchema = z.object({
  academicYear: z.string().optional(),
  compareWith: z.string().optional(),
  placementSeason: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  department: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z.coerce.number().int().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  jobRole: z.string().optional(),
  driveId: z.string().optional(),
  applicationStatus: z.string().optional(),
  placementStatus: z.string().optional(),
  minSalary: z.coerce.number().optional(),
  maxSalary: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;

/**
 * Parse and validate analytics query parameters.
 * Returns validated filters or throws a Zod error.
 */
export function parseAnalyticsFilters(query: Record<string, unknown>): AnalyticsFilterInput {
  return analyticsFilterSchema.parse(query);
}
