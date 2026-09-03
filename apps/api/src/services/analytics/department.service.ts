import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import { prisma, buildImportedStudentWhere } from './analytics.service';
import { INSIGHT_THRESHOLDS } from './analytics.constants';

export interface DepartmentStats {
  department: string;
  totalStudents: number;
  eligibleStudents: number;
  placedStudents: number;
  placementRate: number;
  averagePackage: number;
  medianPackage: number;
  highestPackage: number;
  applicationRate: number;
  // YoY comparison
  previous?: {
    totalStudents: number;
    placedStudents: number;
    placementRate: number;
    averagePackage: number;
  };
  placementRateChange: number;
  packageChange: number;
}

export interface DepartmentRisk {
  department: string;
  placementRate: number;
  institutionRate: number;
  gap: number;
  affectedStudents: number;
  description: string;
}

export interface DepartmentResponse {
  departments: DepartmentStats[];
  institutionRate: number;
  risks: DepartmentRisk[];
}

async function getDeptStats(year: string, dept: string) {
  const where = { academicYear: year, department: dept };
  const [total, eligible, placed, salaries, allSalaries] = await Promise.all([
    prisma.importedStudent.count({ where }),
    prisma.importedStudent.count({ where: { ...where, activeBacklogs: 0 } }),
    prisma.importedStudent.count({ where: { ...where, placementStatus: 'Placed' } }),
    prisma.importedStudent.aggregate({
      where: { ...where, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
      _avg: { fixedSalaryLpa: true },
      _max: { fixedSalaryLpa: true },
    }),
    prisma.importedStudent.findMany({
      where: { ...where, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
      select: { fixedSalaryLpa: true },
      orderBy: { fixedSalaryLpa: 'asc' },
    }),
  ]);

  const participating = await prisma.importedStudent.count({
    where: { ...where, applicationStatus: { not: null } },
  });

  const sorted = allSalaries.map(s => s.fixedSalaryLpa as number);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length > 0
    ? sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
    : 0;

  return {
    total,
    eligible,
    placed,
    placementRate: total > 0 ? parseFloat(((placed / total) * 100).toFixed(2)) : 0,
    averagePackage: salaries._avg.fixedSalaryLpa ? parseFloat(salaries._avg.fixedSalaryLpa.toFixed(2)) : 0,
    medianPackage: parseFloat(median.toFixed(2)),
    highestPackage: salaries._max.fixedSalaryLpa || 0,
    applicationRate: eligible > 0 ? parseFloat(((participating / eligible) * 100).toFixed(2)) : 0,
  };
}

export async function getDepartments(filters: AnalyticsFilterInput): Promise<DepartmentResponse> {
  const currentYear = filters.academicYear || '2026/2027';
  const previousYear = filters.compareWith || '2025/2026';

  const where = buildImportedStudentWhere(filters);
  delete (where as any).academicYear; // we iterate by year

  // Get all departments
  const depts = await prisma.importedStudent.groupBy({
    by: ['department'],
    where: currentYear === 'All Years' ? {} : { academicYear: currentYear },
  });

  // Calculate institution-wide stats
  const instWhere = currentYear === 'All Years' ? {} : { academicYear: currentYear };
  const [instTotal, instPlaced] = await Promise.all([
    prisma.importedStudent.count({ where: instWhere }),
    prisma.importedStudent.count({ where: { ...instWhere, placementStatus: 'Placed' } }),
  ]);
  const institutionRate = instTotal > 0 ? parseFloat(((instPlaced / instTotal) * 100).toFixed(2)) : 0;

  const departments: DepartmentStats[] = [];
  const risks: DepartmentRisk[] = [];

  for (const d of depts) {
    const curr = await getDeptStats(currentYear, d.department);
    const prev = await getDeptStats(previousYear, d.department);

    const stats: DepartmentStats = {
      department: d.department,
      totalStudents: curr.total,
      eligibleStudents: curr.eligible,
      placedStudents: curr.placed,
      placementRate: curr.placementRate,
      averagePackage: curr.averagePackage,
      medianPackage: curr.medianPackage,
      highestPackage: curr.highestPackage,
      applicationRate: curr.applicationRate,
      previous: prev.total > 0 ? {
        totalStudents: prev.total,
        placedStudents: prev.placed,
        placementRate: prev.placementRate,
        averagePackage: prev.averagePackage,
      } : undefined,
      placementRateChange: parseFloat((curr.placementRate - prev.placementRate).toFixed(2)),
      packageChange: parseFloat((curr.averagePackage - prev.averagePackage).toFixed(2)),
    };

    departments.push(stats);

    // Risk detection
    const gap = institutionRate - curr.placementRate;
    if (gap >= INSIGHT_THRESHOLDS.departmentRisk && curr.total >= INSIGHT_THRESHOLDS.minimumSampleSize) {
      risks.push({
        department: d.department,
        placementRate: curr.placementRate,
        institutionRate,
        gap: parseFloat(gap.toFixed(1)),
        affectedStudents: curr.total - curr.placed,
        description: `${d.department} placement rate is ${gap.toFixed(1)} percentage points below the institutional average.`,
      });
    }
  }

  departments.sort((a, b) => b.placementRate - a.placementRate);
  risks.sort((a, b) => b.gap - a.gap);

  return { departments, institutionRate, risks };
}
