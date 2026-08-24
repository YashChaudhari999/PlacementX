import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import { prisma, buildImportedStudentWhere } from './analytics.service';
import { HEALTH_SCORE_WEIGHTS, HEALTH_LABELS } from './analytics.constants';

interface HealthComponent {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface HealthScoreResponse {
  totalScore: number;
  maxScore: 100;
  label: string;
  color: string;
  components: HealthComponent[];
}

export async function getHealthScore(
  filters: AnalyticsFilterInput
): Promise<HealthScoreResponse> {
  const where = buildImportedStudentWhere(filters);
  const prevYear = filters.compareWith;

  // 1. Placement Rate component
  const [total, eligible, placed] = await Promise.all([
    prisma.importedStudent.count({ where }),
    prisma.importedStudent.count({ where: { ...where, activeBacklogs: 0 } }),
    prisma.importedStudent.count({
      where: { ...where, placementStatus: 'Placed' },
    }),
  ]);
  const placementRate = eligible > 0 ? placed / eligible : 0;
  // Score: linear mapping, 100% placement => full weight
  const placementScore = Math.min(
    placementRate * HEALTH_SCORE_WEIGHTS.placementRate,
    HEALTH_SCORE_WEIGHTS.placementRate
  );

  // 2. Application Conversion component
  const participating = await prisma.importedStudent.count({
    where: { ...where, applicationStatus: { not: null } },
  });
  const applicationConversion = eligible > 0 ? participating / eligible : 0;
  const applicationScore = Math.min(
    applicationConversion * HEALTH_SCORE_WEIGHTS.applicationConversion,
    HEALTH_SCORE_WEIGHTS.applicationConversion
  );

  // 3. Interview Conversion (using live DriveApplication data)
  const driveWhere: Record<string, unknown> = {};
  if (filters.academicYear && filters.academicYear !== 'All Years') {
    driveWhere.academicYear = filters.academicYear;
  }
  const [interviewed, offered] = await Promise.all([
    prisma.driveApplication.count({
      where: { status: 'INTERVIEWED', drive: driveWhere },
    }),
    prisma.driveApplication.count({
      where: { status: 'OFFERED', drive: driveWhere },
    }),
  ]);
  const interviewConversion =
    interviewed > 0 ? offered / interviewed : placed > 0 ? 0.5 : 0;
  const interviewScore = Math.min(
    interviewConversion * HEALTH_SCORE_WEIGHTS.interviewConversion,
    HEALTH_SCORE_WEIGHTS.interviewConversion
  );

  // 4. Recruiter Demand (companies participating)
  const companyGroups = await prisma.importedStudent.groupBy({
    by: ['companyName'],
    where: { ...where, companyName: { not: null }, placementStatus: 'Placed' },
  });
  // Normalize: 30+ companies = full score
  const recruiterScore = Math.min(
    (companyGroups.length / 30) * HEALTH_SCORE_WEIGHTS.recruiterDemand,
    HEALTH_SCORE_WEIGHTS.recruiterDemand
  );

  // 5. Student Readiness (from ML predictions)
  const profileWhere: Record<string, unknown> = {};
  if (filters.department && filters.department !== 'All Departments') {
    profileWhere.branch = filters.department;
  }
  const [readyStudents, totalProfiles] = await Promise.all([
    prisma.studentProfile.count({
      where: {
        ...profileWhere,
        isProfileComplete: true,
        profileStatus: 'VERIFIED',
      },
    }),
    prisma.studentProfile.count({ where: profileWhere }),
  ]);
  const readinessRatio =
    totalProfiles > 0 ? readyStudents / totalProfiles : 0;
  const readinessScore = Math.min(
    readinessRatio * HEALTH_SCORE_WEIGHTS.studentReadiness,
    HEALTH_SCORE_WEIGHTS.studentReadiness
  );

  // 6. YoY Growth
  let growthScore = HEALTH_SCORE_WEIGHTS.yoyGrowth * 0.5; // neutral default
  if (prevYear) {
    const prevWhere = buildImportedStudentWhere(filters, prevYear);
    const [prevTotal, prevPlaced] = await Promise.all([
      prisma.importedStudent.count({ where: prevWhere }),
      prisma.importedStudent.count({
        where: { ...prevWhere, placementStatus: 'Placed' },
      }),
    ]);
    const prevRate = prevTotal > 0 ? prevPlaced / prevTotal : 0;
    const currentRate = total > 0 ? placed / total : 0;
    const growth = currentRate - prevRate;
    // Map [-0.2, +0.2] growth to [0, full weight]
    const normalized = Math.min(Math.max((growth + 0.2) / 0.4, 0), 1);
    growthScore = normalized * HEALTH_SCORE_WEIGHTS.yoyGrowth;
  }

  const components: HealthComponent[] = [
    {
      label: 'Placement Rate',
      score: parseFloat(placementScore.toFixed(1)),
      maxScore: HEALTH_SCORE_WEIGHTS.placementRate,
      percentage: parseFloat((placementRate * 100).toFixed(1)),
    },
    {
      label: 'Application Conversion',
      score: parseFloat(applicationScore.toFixed(1)),
      maxScore: HEALTH_SCORE_WEIGHTS.applicationConversion,
      percentage: parseFloat((applicationConversion * 100).toFixed(1)),
    },
    {
      label: 'Interview Conversion',
      score: parseFloat(interviewScore.toFixed(1)),
      maxScore: HEALTH_SCORE_WEIGHTS.interviewConversion,
      percentage: parseFloat((interviewConversion * 100).toFixed(1)),
    },
    {
      label: 'Recruiter Demand',
      score: parseFloat(recruiterScore.toFixed(1)),
      maxScore: HEALTH_SCORE_WEIGHTS.recruiterDemand,
      percentage: parseFloat(
        (Math.min(companyGroups.length / 30, 1) * 100).toFixed(1)
      ),
    },
    {
      label: 'Student Readiness',
      score: parseFloat(readinessScore.toFixed(1)),
      maxScore: HEALTH_SCORE_WEIGHTS.studentReadiness,
      percentage: parseFloat((readinessRatio * 100).toFixed(1)),
    },
    {
      label: 'YoY Growth',
      score: parseFloat(growthScore.toFixed(1)),
      maxScore: HEALTH_SCORE_WEIGHTS.yoyGrowth,
      percentage: parseFloat(
        ((growthScore / HEALTH_SCORE_WEIGHTS.yoyGrowth) * 100).toFixed(1)
      ),
    },
  ];

  const totalScore = parseFloat(
    components.reduce((sum, c) => sum + c.score, 0).toFixed(1)
  );

  const healthLabel =
    HEALTH_LABELS.find(h => totalScore >= h.min) ?? HEALTH_LABELS[HEALTH_LABELS.length - 1];

  return {
    totalScore,
    maxScore: 100,
    label: healthLabel.label,
    color: healthLabel.color,
    components,
  };
}
