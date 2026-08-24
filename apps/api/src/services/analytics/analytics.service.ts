import { PrismaClient } from '@prisma/client';
import { AnalyticsFilterInput } from '../../schemas/analytics.schema';

const prisma = new PrismaClient();

export { prisma };

/**
 * Build a Prisma `where` clause for the ImportedStudent table
 * from validated analytics filters.
 */
export function buildImportedStudentWhere(
  filters: AnalyticsFilterInput,
  yearOverride?: string
) {
  const where: Record<string, unknown> = {};

  const year = yearOverride ?? filters.academicYear;
  if (year && year !== 'All Years') {
    where.academicYear = year;
  }

  if (filters.department && filters.department !== 'All Departments') {
    where.department = filters.department;
  }

  if (filters.placementSeason) {
    where.placementSeason = filters.placementSeason;
  }

  if (filters.companyName) {
    where.companyName = { contains: filters.companyName, mode: 'insensitive' };
  }

  if (filters.placementStatus) {
    where.placementStatus = filters.placementStatus;
  }

  if (filters.applicationStatus) {
    where.applicationStatus = filters.applicationStatus;
  }

  if (filters.minSalary !== undefined || filters.maxSalary !== undefined) {
    const salaryFilter: Record<string, number> = {};
    if (filters.minSalary !== undefined) salaryFilter.gte = filters.minSalary;
    if (filters.maxSalary !== undefined) salaryFilter.lte = filters.maxSalary;
    where.fixedSalaryLpa = salaryFilter;
  }

  return where;
}

/**
 * Build a Prisma `where` clause for DriveApplication queries.
 */
export function buildDriveApplicationWhere(filters: AnalyticsFilterInput) {
  const where: Record<string, unknown> = {};

  if (filters.driveId) {
    where.driveId = filters.driveId;
  }

  if (filters.applicationStatus) {
    where.status = filters.applicationStatus;
  }

  // Filter by drive properties via relation
  const driveWhere: Record<string, unknown> = {};
  if (filters.academicYear && filters.academicYear !== 'All Years') {
    driveWhere.academicYear = filters.academicYear;
  }
  if (filters.companyId) {
    driveWhere.companyId = filters.companyId;
  }
  if (filters.jobRole) {
    driveWhere.jobRole = { contains: filters.jobRole, mode: 'insensitive' };
  }
  if (filters.placementSeason) {
    driveWhere.placementSeason = filters.placementSeason;
  }
  if (filters.department && filters.department !== 'All Departments') {
    driveWhere.department = filters.department;
  }

  if (Object.keys(driveWhere).length > 0) {
    where.drive = driveWhere;
  }

  // Filter by student branch
  if (filters.branch) {
    where.student = { branch: filters.branch };
  }

  return where;
}

/**
 * Build a Prisma `where` clause for PlacementDrive queries.
 */
export function buildDriveWhere(filters: AnalyticsFilterInput) {
  const where: Record<string, unknown> = {};

  if (filters.academicYear && filters.academicYear !== 'All Years') {
    where.academicYear = filters.academicYear;
  }
  if (filters.companyId) {
    where.companyId = filters.companyId;
  }
  if (filters.driveId) {
    where.id = filters.driveId;
  }
  if (filters.jobRole) {
    where.jobRole = { contains: filters.jobRole, mode: 'insensitive' };
  }
  if (filters.placementSeason) {
    where.placementSeason = filters.placementSeason;
  }
  if (filters.department && filters.department !== 'All Departments') {
    where.department = filters.department;
  }

  return where;
}

/**
 * Build a Prisma `where` clause for StudentProfile queries.
 */
export function buildStudentProfileWhere(filters: AnalyticsFilterInput) {
  const where: Record<string, unknown> = {};

  if (filters.department && filters.department !== 'All Departments') {
    where.branch = filters.department;
  }
  if (filters.branch) {
    where.branch = filters.branch;
  }
  if (filters.graduationYear) {
    where.passingYear = filters.graduationYear;
  }

  return where;
}

/**
 * Compute median from a sorted array of numbers.
 */
export function computeMedian(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Compute percentile from a sorted array.
 */
export function computePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

/**
 * Get distinct academic years from ImportedStudent.
 */
export async function getDistinctAcademicYears(): Promise<string[]> {
  const years = await prisma.importedStudent.groupBy({
    by: ['academicYear'],
    orderBy: { academicYear: 'desc' },
  });
  return years.map(y => y.academicYear);
}

/**
 * Get distinct departments from ImportedStudent.
 */
export async function getDistinctDepartments(): Promise<string[]> {
  const depts = await prisma.importedStudent.groupBy({
    by: ['department'],
    orderBy: { department: 'asc' },
  });
  return depts.map(d => d.department);
}
