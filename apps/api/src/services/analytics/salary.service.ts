import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import {
  prisma,
  buildImportedStudentWhere,
  computeMedian,
  computePercentile,
} from './analytics.service';
import { SALARY_BANDS, INSIGHT_THRESHOLDS } from './analytics.constants';

export interface SalaryStats {
  averagePackage: number;
  medianPackage: number;
  minPackage: number;
  maxPackage: number;
  p25: number;
  p75: number;
  count: number;
  distribution: { label: string; count: number }[];
}

export interface SalaryInsight {
  hasSkew: boolean;
  description: string | null;
  average: number;
  median: number;
}

export interface SalaryResponse {
  current: SalaryStats;
  previous: SalaryStats | null;
  insight: SalaryInsight;
}

async function computeSalaryStats(where: Record<string, unknown>): Promise<SalaryStats> {
  const [agg, allSalaries] = await Promise.all([
    prisma.importedStudent.aggregate({
      where: { ...where, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
      _avg: { fixedSalaryLpa: true },
      _max: { fixedSalaryLpa: true },
      _min: { fixedSalaryLpa: true },
      _count: { fixedSalaryLpa: true },
    }),
    prisma.importedStudent.findMany({
      where: { ...where, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
      select: { fixedSalaryLpa: true },
      orderBy: { fixedSalaryLpa: 'asc' },
    }),
  ]);

  const sorted = allSalaries.map(s => s.fixedSalaryLpa as number);

  // Distribution using configured salary bands
  const distribution = SALARY_BANDS.map(band => ({
    label: band.label,
    count: sorted.filter(v => v >= band.min && v < band.max).length,
  }));

  return {
    averagePackage: agg._avg.fixedSalaryLpa ? parseFloat(agg._avg.fixedSalaryLpa.toFixed(2)) : 0,
    medianPackage: parseFloat(computeMedian(sorted).toFixed(2)),
    minPackage: agg._min.fixedSalaryLpa || 0,
    maxPackage: agg._max.fixedSalaryLpa || 0,
    p25: parseFloat(computePercentile(sorted, 25).toFixed(2)),
    p75: parseFloat(computePercentile(sorted, 75).toFixed(2)),
    count: agg._count.fixedSalaryLpa,
    distribution,
  };
}

export async function getSalary(filters: AnalyticsFilterInput): Promise<SalaryResponse> {
  const currentWhere = buildImportedStudentWhere(filters);
  const current = await computeSalaryStats(currentWhere);

  let previous: SalaryStats | null = null;
  if (filters.compareWith) {
    const prevWhere = buildImportedStudentWhere(filters, filters.compareWith);
    previous = await computeSalaryStats(prevWhere);
  }

  // Salary quality insight
  const hasSkew =
    current.count >= INSIGHT_THRESHOLDS.minimumSampleSize &&
    current.medianPackage > 0 &&
    current.averagePackage / current.medianPackage >= INSIGHT_THRESHOLDS.salarySkewThreshold;

  const insight: SalaryInsight = {
    hasSkew,
    description: hasSkew
      ? `Average package is ₹${current.averagePackage} LPA while median package is ₹${current.medianPackage} LPA. This suggests that a small number of high-value offers are influencing the average.`
      : null,
    average: current.averagePackage,
    median: current.medianPackage,
  };

  return { current, previous, insight };
}
