/**
 * PlacementX — Analytics Type Definitions
 *
 * Strongly typed interfaces for all analytics API responses.
 */

// ── Filter Types ──────────────────────────────────────────
export interface AnalyticsFilters {
  academicYear?: string;
  compareWith?: string;
  placementSeason?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  branch?: string;
  graduationYear?: number;
  companyId?: string;
  companyName?: string;
  jobRole?: string;
  driveId?: string;
  applicationStatus?: string;
  placementStatus?: string;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface FilterOptions {
  academicYears: string[];
  departments: string[];
  companies: string[];
  seasons: string[];
  jobRoles: string[];
  driveStatuses: string[];
  applicationStatuses: string[];
  placementStatuses: string[];
}

// ── Overview Types ────────────────────────────────────────
export interface OverviewStats {
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

// ── Health Score Types ────────────────────────────────────
export interface HealthComponent {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface HealthScoreResponse {
  totalScore: number;
  maxScore: number;
  label: string;
  color: string;
  components: HealthComponent[];
}

// ── Funnel Types ──────────────────────────────────────────
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

// ── Department Types ──────────────────────────────────────
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

// ── Company Types ─────────────────────────────────────────
export interface CompanyStats {
  companyName: string;
  offers: number;
  averagePackage: number;
  highestPackage: number;
  departments: string[];
}

export interface RecruiterRetention {
  returning: string[];
  new: string[];
  lost: string[];
  returningCount: number;
  newCount: number;
  lostCount: number;
  retentionRate: number | null;
}

export interface CompanyResponse {
  topCompanies: CompanyStats[];
  totalCompanies: number;
  previousCompanies: number;
  retention: RecruiterRetention | null;
}

// ── Salary Types ──────────────────────────────────────────
export interface SalaryBand {
  label: string;
  count: number;
}

export interface SalaryStats {
  averagePackage: number;
  medianPackage: number;
  minPackage: number;
  maxPackage: number;
  p25: number;
  p75: number;
  count: number;
  distribution: SalaryBand[];
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

// ── Student Risk Types ────────────────────────────────────
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

export interface ProfileReadiness {
  complete: number;
  verified: number;
  pending: number;
  rejected: number;
  missingResume: number;
  missingSkills: number;
}

export interface StudentRiskResponse {
  summary: StudentRiskSummary;
  students: StudentRiskRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  profileReadiness: ProfileReadiness;
}

// ── Skill Gap Types ───────────────────────────────────────
export interface SkillGapRow {
  skill: string;
  studentSupply: number;
  recruiterDemand: number;
  gap: number;
  coverage: number;
}

export interface SkillGapRecommendation {
  skill: string;
  gap: number;
  recommendation: string;
}

export interface SkillGapResponse {
  skills: SkillGapRow[];
  topShortages: SkillGapRow[];
  topSurpluses: SkillGapRow[];
  recommendations: SkillGapRecommendation[];
}

// ── Drive Analytics Types ─────────────────────────────────
export interface DriveAnalyticsRow {
  id: string;
  driveTitle: string | null;
  companyName: string;
  jobRole: string | null;
  status: string;
  totalApplications: number;
  applied: number;
  shortlisted: number;
  interviewed: number;
  offered: number;
  rejected: number;
  offerConversion: number;
  packageLpa: number | null;
}

export interface DriveAnalyticsSummary {
  totalDrives: number;
  activeDrives: number;
  completedDrives: number;
  totalApplications: number;
  totalOffers: number;
  avgApplicationsPerDrive: number;
}

export interface DriveAnalyticsResponse {
  drives: DriveAnalyticsRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  summary: DriveAnalyticsSummary;
}

// ── Insight Types ─────────────────────────────────────────
export type InsightSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'POSITIVE' | 'OPPORTUNITY';
export type InsightCategory =
  | 'PLACEMENT'
  | 'DEPARTMENT'
  | 'STUDENT'
  | 'COMPANY'
  | 'SKILL'
  | 'SALARY'
  | 'DRIVE'
  | 'RECRUITER'
  | 'OPERATIONS'
  | 'FORECAST';

export interface PlacementInsight {
  id: string;
  severity: InsightSeverity;
  category: InsightCategory;
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

export interface InsightsSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  positive: number;
  opportunity: number;
  total: number;
}

export interface InsightsResponse {
  insights: PlacementInsight[];
  summary: InsightsSummary;
}

// ── Action Center Types ───────────────────────────────────
export interface ActionItem {
  priority: InsightSeverity;
  problem: string;
  evidence: string;
  affectedCount: number | null;
  recommendedAction: string | null;
  category: InsightCategory;
  metric: string;
  currentValue: number;
}

export interface OperationalHealth {
  pendingVerifications: number;
  pendingUpdateRequests: number;
  drivesAwaitingApproval: number;
  activeDrives: number;
  completedDrives: number;
  upcomingEvents: {
    id: string;
    title: string;
    date: string | null;
    driveTitle: string | null;
    companyName: string;
  }[];
  recentDriveActivity: number;
}

export interface ActionCenterResponse {
  actions: ActionItem[];
  summary: InsightsSummary;
  operational: OperationalHealth;
}

// ── Year Comparison Types ─────────────────────────────────
export interface YearComparisonRow {
  year: string;
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  placementRate: number;
  averagePackage: number;
  recruiters: number;
}

// ── Forecast Types ────────────────────────────────────────
export interface ForecastResponse {
  projectedPlacementRate: number | null;
  confidenceInterval: [number, number] | null;
  projectedAveragePackage: number | null;
  projectedVisitingCompanies: number | null;
  trend: string;
  department: string;
  targetYear: string;
  modelVersion: string;
  error?: string;
}
