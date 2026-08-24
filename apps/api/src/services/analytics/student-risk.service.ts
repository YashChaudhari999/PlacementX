import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import { prisma, buildStudentProfileWhere } from './analytics.service';
import { READINESS_TIERS } from './analytics.constants';

export interface StudentRiskSummary {
  highReadiness: number;
  moderateReadiness: number;
  needsImprovement: number;
  highIntervention: number;
  totalProfiles: number;
}

export interface StudentRiskRow {
  id: string;
  name: string;
  department: string | null;
  cgpa: number | null;
  profileStatus: string;
  readinessScore: number | null;
  riskLevel: string | null;
  applicationsCount: number;
  shortlistsCount: number;
  offersCount: number;
  isProfileComplete: boolean;
  hasResume: boolean;
  hasSkills: boolean;
  interventionArea: string | null;
}

export interface StudentRiskResponse {
  summary: StudentRiskSummary;
  students: StudentRiskRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  profileReadiness: {
    complete: number;
    verified: number;
    pending: number;
    rejected: number;
    missingResume: number;
    missingSkills: number;
  };
}

function determineIntervention(student: any): string | null {
  if (!student.isProfileComplete) return 'Profile Completion';
  if (student.profileStatus !== 'VERIFIED') return 'Profile Completion';
  if (!student.resumeUrl) return 'Resume';
  if (!student.skills || (Array.isArray(student.skills) && student.skills.length === 0)) return 'Skills';
  if (student.cgpa && student.cgpa < 6.0) return 'Academic';
  if (student._count?.applications === 0) return 'Application Participation';
  const shortlists = student.applications?.filter((a: any) => 
    ['SHORTLISTED', 'INTERVIEWED', 'OFFERED'].includes(a.status)
  ).length || 0;
  if (student._count?.applications > 2 && shortlists === 0) return 'Resume';
  return null;
}

export async function getStudentRisk(filters: AnalyticsFilterInput): Promise<StudentRiskResponse> {
  const where = buildStudentProfileWhere(filters);
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;

  // Summary: risk distribution from ML predictions
  const riskStats = await prisma.studentProfile.groupBy({
    by: ['riskLevel'],
    where,
    _count: { _all: true },
  });

  const totalProfiles = await prisma.studentProfile.count({ where });

  // Readiness tiers from predictedSuccessRate
  const profiles = await prisma.studentProfile.findMany({
    where,
    select: { predictedSuccessRate: true },
  });

  let highReadiness = 0, moderateReadiness = 0, needsImprovement = 0, highIntervention = 0;
  for (const p of profiles) {
    const rate = p.predictedSuccessRate ?? 0;
    if (rate >= READINESS_TIERS.high.min) highReadiness++;
    else if (rate >= READINESS_TIERS.moderate.min) moderateReadiness++;
    else if (rate >= READINESS_TIERS.needsImprovement.min) needsImprovement++;
    else highIntervention++;
  }

  // Use risk level grouping if ML predictions not available
  if (highReadiness + moderateReadiness + needsImprovement + highIntervention === 0) {
    highReadiness = riskStats.find((r: any) => r.riskLevel === 'LOW')?._count._all || 0;
    moderateReadiness = riskStats.find((r: any) => r.riskLevel === 'MEDIUM')?._count._all || 0;
    highIntervention = riskStats.find((r: any) => r.riskLevel === 'HIGH')?._count._all || 0;
  }

  // Paginated student list (sorted by risk: high priority first)
  const studentsRaw = await prisma.studentProfile.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      branch: true,
      cgpa: true,
      profileStatus: true,
      predictedSuccessRate: true,
      riskLevel: true,
      isProfileComplete: true,
      resumeUrl: true,
      skills: true,
      _count: { select: { applications: true } },
      applications: {
        select: { status: true },
      },
    },
    orderBy: [
      { predictedSuccessRate: 'asc' },
    ],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const students: StudentRiskRow[] = studentsRaw.map((s: any) => {
    const shortlists = s.applications?.filter((a: any) =>
      ['SHORTLISTED', 'INTERVIEWED', 'OFFERED'].includes(a.status)
    ).length || 0;
    const offers = s.applications?.filter((a: any) => a.status === 'OFFERED').length || 0;

    return {
      id: s.id,
      name: [s.firstName, s.lastName].filter(Boolean).join(' ') || 'Unknown',
      department: s.branch,
      cgpa: s.cgpa,
      profileStatus: s.profileStatus,
      readinessScore: s.predictedSuccessRate ? parseFloat((s.predictedSuccessRate * 100).toFixed(1)) : null,
      riskLevel: s.riskLevel,
      applicationsCount: s._count.applications,
      shortlistsCount: shortlists,
      offersCount: offers,
      isProfileComplete: s.isProfileComplete,
      hasResume: !!s.resumeUrl,
      hasSkills: !!(s.skills && (Array.isArray(s.skills) ? s.skills.length > 0 : true)),
      interventionArea: determineIntervention(s),
    };
  });

  // Profile readiness
  const [complete, verified, pending, rejected, missingResume, missingSkills] = await Promise.all([
    prisma.studentProfile.count({ where: { ...where, isProfileComplete: true } }),
    prisma.studentProfile.count({ where: { ...where, profileStatus: 'VERIFIED' } }),
    prisma.studentProfile.count({ where: { ...where, profileStatus: 'PENDING_VERIFICATION' } }),
    prisma.studentProfile.count({ where: { ...where, profileStatus: 'REJECTED' } }),
    prisma.studentProfile.count({ where: { ...where, resumeUrl: null } }),
    prisma.studentProfile.count({ where: { ...where, skills: { equals: null as any } } }),
  ]);

  return {
    summary: { highReadiness, moderateReadiness, needsImprovement, highIntervention, totalProfiles },
    students,
    totalCount: totalProfiles,
    page,
    pageSize,
    profileReadiness: { complete, verified, pending, rejected, missingResume, missingSkills },
  };
}
