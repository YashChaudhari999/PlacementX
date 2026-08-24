import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import { prisma, buildImportedStudentWhere, buildDriveWhere } from './analytics.service';

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  conversionFromPrevious: number | null;
}

export interface FunnelInsight {
  largestDrop: { from: string; to: string; dropPercentage: number } | null;
  description: string | null;
  recommendation: string | null;
}

export interface FunnelResponse {
  stages: FunnelStage[];
  insight: FunnelInsight;
}

export async function getFunnel(filters: AnalyticsFilterInput): Promise<FunnelResponse> {
  const where = buildImportedStudentWhere(filters);

  // ImportedStudent-based funnel
  const totalStudents = await prisma.importedStudent.count({ where });
  const eligibleStudents = await prisma.importedStudent.count({
    where: { ...where, activeBacklogs: 0 },
  });
  const participating = await prisma.importedStudent.count({
    where: { ...where, applicationStatus: { not: null } },
  });
  const placed = await prisma.importedStudent.count({
    where: { ...where, placementStatus: 'Placed' },
  });

  // Live DriveApplication-based funnel (for richer stages)
  const driveWhere = buildDriveWhere(filters);
  const [applied, shortlisted, interviewed, offered] = await Promise.all([
    prisma.driveApplication.count({ where: { status: 'APPLIED', drive: driveWhere } }),
    prisma.driveApplication.count({ where: { status: 'SHORTLISTED', drive: driveWhere } }),
    prisma.driveApplication.count({ where: { status: 'INTERVIEWED', drive: driveWhere } }),
    prisma.driveApplication.count({ where: { status: 'OFFERED', drive: driveWhere } }),
  ]);

  // Use live data if available, otherwise fall back to ImportedStudent data
  const hasLiveData = applied + shortlisted + interviewed + offered > 0;

  const stages: FunnelStage[] = hasLiveData
    ? [
        { stage: 'Eligible', count: eligibleStudents || totalStudents, percentage: 100, conversionFromPrevious: null },
        { stage: 'Applied', count: applied + shortlisted + interviewed + offered, percentage: 0, conversionFromPrevious: null },
        { stage: 'Shortlisted', count: shortlisted + interviewed + offered, percentage: 0, conversionFromPrevious: null },
        { stage: 'Interviewed', count: interviewed + offered, percentage: 0, conversionFromPrevious: null },
        { stage: 'Offered', count: offered, percentage: 0, conversionFromPrevious: null },
      ]
    : [
        { stage: 'Total Students', count: totalStudents, percentage: 100, conversionFromPrevious: null },
        { stage: 'Eligible', count: eligibleStudents, percentage: 0, conversionFromPrevious: null },
        { stage: 'Participating', count: participating, percentage: 0, conversionFromPrevious: null },
        { stage: 'Placed', count: placed, percentage: 0, conversionFromPrevious: null },
      ];

  // Calculate percentages and conversions
  for (let i = 0; i < stages.length; i++) {
    if (i === 0) {
      stages[i].percentage = 100;
    } else {
      const prevCount = stages[i - 1].count;
      stages[i].percentage = prevCount > 0 ? Math.round((stages[i].count / prevCount) * 100) : 0;
      stages[i].conversionFromPrevious = stages[i].percentage;
    }
  }

  // Find largest funnel drop
  let largestDrop: FunnelInsight['largestDrop'] = null;
  let maxDrop = 0;
  for (let i = 1; i < stages.length; i++) {
    const drop = 100 - stages[i].percentage;
    if (drop > maxDrop && stages[i - 1].count > 0) {
      maxDrop = drop;
      largestDrop = {
        from: stages[i - 1].stage,
        to: stages[i].stage,
        dropPercentage: drop,
      };
    }
  }

  let description: string | null = null;
  let recommendation: string | null = null;
  if (largestDrop && largestDrop.dropPercentage > 30) {
    description = `Only ${100 - largestDrop.dropPercentage}% of ${largestDrop.from.toLowerCase()} candidates reach the ${largestDrop.to.toLowerCase()} stage.`;
    recommendation = `Review ${largestDrop.to.toLowerCase()} criteria and preparation programs to improve conversion from ${largestDrop.from.toLowerCase()}.`;
  }

  return {
    stages,
    insight: { largestDrop, description, recommendation },
  };
}
