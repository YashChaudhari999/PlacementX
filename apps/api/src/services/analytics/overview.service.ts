import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import {
  prisma,
  buildImportedStudentWhere,
  computeMedian,
} from './analytics.service';

interface OverviewStats {
  totalStudents: number;
  eligibleStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  placementRate: number;
  overallPlacementRate: number;
  activeDrives: number;
  participatingCompanies: number;
  totalOffers: number;
  averagePackage: number | null;
  medianPackage: number | null;
  highestPackage: number | null;
  recruiterRetentionRate: number | null;
}

export interface OverviewResponse {
  current: OverviewStats;
  previous: OverviewStats | null;
}

async function fetchOverviewStats(
  filters: AnalyticsFilterInput,
  yearOverride?: string
): Promise<OverviewStats> {
  const where = buildImportedStudentWhere(filters, yearOverride);

  const [totalStudents, eligibleStudents, placedStudents, salaryAgg, salaries] =
    await Promise.all([
      prisma.importedStudent.count({ where }),
      prisma.importedStudent.count({ where: { ...where, activeBacklogs: 0 } }),
      prisma.importedStudent.count({
        where: { ...where, placementStatus: 'Placed' },
      }),
      prisma.importedStudent.aggregate({
        where: {
          ...where,
          placementStatus: 'Placed',
          fixedSalaryLpa: { not: null },
        },
        _avg: { fixedSalaryLpa: true },
        _max: { fixedSalaryLpa: true },
      }),
      prisma.importedStudent.findMany({
        where: {
          ...where,
          placementStatus: 'Placed',
          fixedSalaryLpa: { not: null },
        },
        select: { fixedSalaryLpa: true },
        orderBy: { fixedSalaryLpa: 'asc' },
      }),
    ]);

  // Median package
  const sortedSalaries = salaries
    .map(s => s.fixedSalaryLpa as number)
    .filter(v => v != null);
  const medianPackage =
    sortedSalaries.length > 0
      ? parseFloat(computeMedian(sortedSalaries).toFixed(2))
      : null;

  // Live drive data
  const driveYear =
    yearOverride ?? filters.academicYear ?? undefined;
  const driveWhere: Record<string, unknown> = {};
  if (driveYear && driveYear !== 'All Years') {
    driveWhere.academicYear = driveYear;
  }

  const [activeDrives, companyGroups, offerCount] = await Promise.all([
    prisma.placementDrive.count({
      where: { ...driveWhere, status: 'ACTIVE' },
    }),
    prisma.placementDrive.groupBy({
      by: ['companyId'],
      where: driveWhere,
    }),
    prisma.driveApplication.count({
      where: {
        status: 'OFFERED',
        drive: driveWhere,
      },
    }),
  ]);

  const unplacedStudents = totalStudents - placedStudents;
  const placementRate =
    eligibleStudents > 0
      ? parseFloat(((placedStudents / eligibleStudents) * 100).toFixed(2))
      : 0;
  const overallPlacementRate =
    totalStudents > 0
      ? parseFloat(((placedStudents / totalStudents) * 100).toFixed(2))
      : 0;

  return {
    totalStudents,
    eligibleStudents,
    placedStudents,
    unplacedStudents,
    placementRate,
    overallPlacementRate,
    activeDrives,
    participatingCompanies: companyGroups.length,
    totalOffers: offerCount || placedStudents,
    averagePackage: salaryAgg._avg.fixedSalaryLpa
      ? parseFloat(salaryAgg._avg.fixedSalaryLpa.toFixed(2))
      : null,
    medianPackage,
    highestPackage: salaryAgg._max.fixedSalaryLpa ?? null,
    recruiterRetentionRate: null, // computed separately if compareWith present
  };
}

/**
 * Compute recruiter retention: returning companies / previous-year companies.
 */
async function computeRecruiterRetention(
  currentYear: string,
  previousYear: string
): Promise<number | null> {
  const [currentCompanies, previousCompanies] = await Promise.all([
    prisma.importedStudent.groupBy({
      by: ['companyName'],
      where: {
        academicYear: currentYear,
        companyName: { not: null },
        placementStatus: 'Placed',
      },
    }),
    prisma.importedStudent.groupBy({
      by: ['companyName'],
      where: {
        academicYear: previousYear,
        companyName: { not: null },
        placementStatus: 'Placed',
      },
    }),
  ]);

  if (previousCompanies.length === 0) return null;

  const prevNames = new Set(previousCompanies.map(c => c.companyName));
  const returning = currentCompanies.filter(c => prevNames.has(c.companyName));

  return parseFloat(
    ((returning.length / previousCompanies.length) * 100).toFixed(1)
  );
}

export async function getOverview(
  filters: AnalyticsFilterInput
): Promise<OverviewResponse> {
  const current = await fetchOverviewStats(filters);

  let previous: OverviewStats | null = null;
  if (filters.compareWith && filters.academicYear !== 'All Years' && filters.compareWith !== 'All Years') {
    previous = await fetchOverviewStats(filters, filters.compareWith);
    // Compute recruiter retention
    const currentYear = filters.academicYear || '2026/2027';
    current.recruiterRetentionRate = await computeRecruiterRetention(
      currentYear,
      filters.compareWith
    );
  }

  return { current, previous };
}
