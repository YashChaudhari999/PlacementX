import { AnalyticsFilterInput } from '../../schemas/analytics.schema';
import { prisma, buildImportedStudentWhere } from './analytics.service';
import { INSIGHT_THRESHOLDS, INSIGHT_SEVERITIES, INSIGHT_CATEGORIES } from './analytics.constants';

type Severity = typeof INSIGHT_SEVERITIES[number];
type Category = typeof INSIGHT_CATEGORIES[number];

export interface PlacementInsight {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  benchmarkValue: number | null;
  gap: number | null;
  affectedCount: number | null;
  recommendedAction: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  generatedAt: string;
}

export interface InsightsResponse {
  insights: PlacementInsight[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    positive: number;
    opportunity: number;
    total: number;
  };
}

let insightCounter = 0;
function makeId(): string {
  return `insight-${Date.now()}-${++insightCounter}`;
}

export async function getInsights(filters: AnalyticsFilterInput): Promise<InsightsResponse> {
  const insights: PlacementInsight[] = [];
  const now = new Date().toISOString();
  const currentYear = filters.academicYear || '2026/2027';
  if (currentYear === 'All Years') {
    return [];
  }
  const previousYear = filters.compareWith || '2025/2026';
  const where = buildImportedStudentWhere(filters);

  // ── 1. Placement Rate Change ────────────────────────────
  const [currTotal, currPlaced, prevTotal, prevPlaced] = await Promise.all([
    prisma.importedStudent.count({ where }),
    prisma.importedStudent.count({ where: { ...where, placementStatus: 'Placed' } }),
    prisma.importedStudent.count({ where: { academicYear: previousYear } }),
    prisma.importedStudent.count({ where: { academicYear: previousYear, placementStatus: 'Placed' } }),
  ]);

  const currRate = currTotal > 0 ? (currPlaced / currTotal) * 100 : 0;
  const prevRate = prevTotal > 0 ? (prevPlaced / prevTotal) * 100 : 0;
  const rateDiff = currRate - prevRate;

  if (rateDiff < -INSIGHT_THRESHOLDS.placementDrop) {
    insights.push({
      id: makeId(), severity: 'CRITICAL', category: 'PLACEMENT',
      title: 'Placement Rate Decline',
      description: `Overall placement rate declined by ${Math.abs(rateDiff).toFixed(1)} percentage points compared to ${previousYear}.`,
      metric: 'Placement Rate', currentValue: parseFloat(currRate.toFixed(1)),
      benchmarkValue: parseFloat(prevRate.toFixed(1)), gap: parseFloat(rateDiff.toFixed(1)),
      affectedCount: currTotal - currPlaced,
      recommendedAction: 'Investigate the decline: review recruiter outreach, student preparation, and funnel conversion rates.',
      confidence: currTotal >= 50 ? 'HIGH' : 'MEDIUM', generatedAt: now,
    });
  } else if (rateDiff > INSIGHT_THRESHOLDS.placementDrop) {
    insights.push({
      id: makeId(), severity: 'POSITIVE', category: 'PLACEMENT',
      title: 'Placement Rate Improvement',
      description: `Placement rate improved by ${rateDiff.toFixed(1)} percentage points compared to ${previousYear}.`,
      metric: 'Placement Rate', currentValue: parseFloat(currRate.toFixed(1)),
      benchmarkValue: parseFloat(prevRate.toFixed(1)), gap: parseFloat(rateDiff.toFixed(1)),
      affectedCount: null,
      recommendedAction: 'Continue current strategies and identify which initiatives contributed most to growth.',
      confidence: 'HIGH', generatedAt: now,
    });
  }

  // ── 2. Department Risk ──────────────────────────────────
  const depts = await prisma.importedStudent.groupBy({
    by: ['department'],
    where: { academicYear: currentYear },
    _count: { _all: true },
  });

  for (const dept of depts) {
    if (dept._count._all < INSIGHT_THRESHOLDS.minimumSampleSize) continue;
    const deptPlaced = await prisma.importedStudent.count({
      where: { academicYear: currentYear, department: dept.department, placementStatus: 'Placed' },
    });
    const deptRate = (deptPlaced / dept._count._all) * 100;
    const deptGap = currRate - deptRate;

    if (deptGap >= INSIGHT_THRESHOLDS.departmentRisk) {
      insights.push({
        id: makeId(), severity: 'HIGH', category: 'DEPARTMENT',
        title: `${dept.department} — Below Average`,
        description: `${dept.department} placement rate (${deptRate.toFixed(1)}%) is ${deptGap.toFixed(1)} percentage points below the institutional average.`,
        metric: 'Dept Placement Rate', currentValue: parseFloat(deptRate.toFixed(1)),
        benchmarkValue: parseFloat(currRate.toFixed(1)), gap: parseFloat((-deptGap).toFixed(1)),
        affectedCount: dept._count._all - deptPlaced,
        recommendedAction: `Run targeted skill development and interview preparation programs for ${dept.department}.`,
        confidence: 'HIGH', generatedAt: now,
      });
    }
  }

  // ── 3. Salary Skew ─────────────────────────────────────
  const salaries = await prisma.importedStudent.findMany({
    where: { ...where, placementStatus: 'Placed', fixedSalaryLpa: { not: null } },
    select: { fixedSalaryLpa: true },
    orderBy: { fixedSalaryLpa: 'asc' },
  });
  if (salaries.length >= INSIGHT_THRESHOLDS.minimumSampleSize) {
    const sorted = salaries.map(s => s.fixedSalaryLpa as number);
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    if (median > 0 && avg / median >= INSIGHT_THRESHOLDS.salarySkewThreshold) {
      insights.push({
        id: makeId(), severity: 'MEDIUM', category: 'SALARY',
        title: 'Salary Distribution Skew',
        description: `Average package (₹${avg.toFixed(2)} LPA) is significantly higher than median (₹${median.toFixed(2)} LPA), indicating a few high-value offers influence the average.`,
        metric: 'Avg/Median Ratio', currentValue: parseFloat((avg / median).toFixed(2)),
        benchmarkValue: 1.0, gap: parseFloat(((avg / median) - 1).toFixed(2)),
        affectedCount: null,
        recommendedAction: 'Focus on improving median package by targeting mid-range recruiters offering ₹6-10 LPA roles.',
        confidence: 'HIGH', generatedAt: now,
      });
    }
  }

  // ── 4. Recruiter Change ────────────────────────────────
  const [currCompanies, prevCompanies] = await Promise.all([
    prisma.importedStudent.groupBy({
      by: ['companyName'],
      where: { academicYear: currentYear, companyName: { not: null }, placementStatus: 'Placed' },
    }),
    prisma.importedStudent.groupBy({
      by: ['companyName'],
      where: { academicYear: previousYear, companyName: { not: null }, placementStatus: 'Placed' },
    }),
  ]);

  if (prevCompanies.length > 0) {
    const prevNames = new Set(prevCompanies.map(c => c.companyName));
    const currNames = new Set(currCompanies.map(c => c.companyName));
    const lost = [...prevNames].filter(n => !currNames.has(n));

    if (lost.length >= 3) {
      insights.push({
        id: makeId(), severity: 'HIGH', category: 'RECRUITER',
        title: 'Recruiter Attrition',
        description: `${lost.length} companies that recruited in ${previousYear} have not participated this year.`,
        metric: 'Lost Recruiters', currentValue: lost.length,
        benchmarkValue: 0, gap: lost.length,
        affectedCount: lost.length,
        recommendedAction: 'Reach out to non-returning companies to understand reasons and re-engage.',
        confidence: 'HIGH', generatedAt: now,
      });
    }
  }

  // ── 5. Profile Readiness Risk ──────────────────────────
  const [totalProfiles, incompleteProfiles] = await Promise.all([
    prisma.studentProfile.count({}),
    prisma.studentProfile.count({ where: { isProfileComplete: false } }),
  ]);
  if (totalProfiles > 0) {
    const incompleteRate = (incompleteProfiles / totalProfiles) * 100;
    if (incompleteRate > INSIGHT_THRESHOLDS.profileReadinessRisk) {
      insights.push({
        id: makeId(), severity: 'MEDIUM', category: 'STUDENT',
        title: 'Profile Readiness Risk',
        description: `${incompleteRate.toFixed(0)}% of student profiles are incomplete (${incompleteProfiles} students).`,
        metric: 'Incomplete Profiles %', currentValue: parseFloat(incompleteRate.toFixed(1)),
        benchmarkValue: INSIGHT_THRESHOLDS.profileReadinessRisk, gap: parseFloat((incompleteRate - INSIGHT_THRESHOLDS.profileReadinessRisk).toFixed(1)),
        affectedCount: incompleteProfiles,
        recommendedAction: 'Send targeted reminders to students with incomplete profiles and set a completion deadline.',
        confidence: 'HIGH', generatedAt: now,
      });
    }
  }

  // ── Sort by priority ───────────────────────────────────
  const severityOrder: Record<string, number> = {
    CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, OPPORTUNITY: 4, POSITIVE: 5,
  };
  insights.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));

  const summary = {
    critical: insights.filter(i => i.severity === 'CRITICAL').length,
    high: insights.filter(i => i.severity === 'HIGH').length,
    medium: insights.filter(i => i.severity === 'MEDIUM').length,
    low: insights.filter(i => i.severity === 'LOW').length,
    positive: insights.filter(i => i.severity === 'POSITIVE').length,
    opportunity: insights.filter(i => i.severity === 'OPPORTUNITY').length,
    total: insights.length,
  };

  return { insights, summary };
}
