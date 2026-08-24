/**
 * Analytics Configuration Constants
 * 
 * All configurable thresholds, weights, and detection rules for
 * the Placement Intelligence system. Change these to tune insight
 * sensitivity without modifying business logic.
 */

// ── Health Score Weights (must sum to 100) ────────────────
export const HEALTH_SCORE_WEIGHTS = {
  placementRate: 30,
  applicationConversion: 20,
  interviewConversion: 15,
  recruiterDemand: 15,
  studentReadiness: 10,
  yoyGrowth: 10,
} as const;

// ── Insight Detection Thresholds ──────────────────────────
export const INSIGHT_THRESHOLDS = {
  /** Placement rate drop (percentage points) vs previous year */
  placementDrop: 5,
  /** Department placement rate below institution average (pp) */
  departmentRisk: 10,
  /** Funnel conversion rate below historical benchmark (pp) */
  funnelRisk: 10,
  /** Minimum sample size for statistical conclusions */
  minimumSampleSize: 10,
  /** Average vs Median salary skew threshold (multiplier) */
  salarySkewThreshold: 1.3,
  /** Profile readiness: % of incomplete profiles considered risky */
  profileReadinessRisk: 30,
  /** Skill gap: minimum demand-supply gap to flag */
  skillGapThreshold: 10,
  /** Application risk: eligible but < N applications */
  applicationRiskMinApps: 1,
} as const;

// ── Salary Bands ──────────────────────────────────────────
export const SALARY_BANDS = [
  { label: '< 4 LPA', min: 0, max: 4 },
  { label: '4–6 LPA', min: 4, max: 6 },
  { label: '6–10 LPA', min: 6, max: 10 },
  { label: '10–15 LPA', min: 10, max: 15 },
  { label: '15–20 LPA', min: 15, max: 20 },
  { label: '20+ LPA', min: 20, max: Infinity },
] as const;

// ── Student Readiness Tiers ───────────────────────────────
export const READINESS_TIERS = {
  high: { label: 'High Readiness', min: 0.75, color: 'emerald' },
  moderate: { label: 'Moderate Readiness', min: 0.50, color: 'amber' },
  needsImprovement: { label: 'Needs Improvement', min: 0.25, color: 'orange' },
  highIntervention: { label: 'High Intervention Priority', min: 0, color: 'rose' },
} as const;

// ── Insight Categories ────────────────────────────────────
export const INSIGHT_CATEGORIES = [
  'PLACEMENT', 'DEPARTMENT', 'STUDENT', 'COMPANY',
  'SKILL', 'SALARY', 'DRIVE', 'RECRUITER',
  'OPERATIONS', 'FORECAST',
] as const;

export const INSIGHT_SEVERITIES = [
  'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'POSITIVE', 'OPPORTUNITY',
] as const;

// ── Health Score Labels ───────────────────────────────────
export const HEALTH_LABELS = [
  { min: 80, label: 'Excellent', color: 'emerald' },
  { min: 60, label: 'Healthy', color: 'blue' },
  { min: 40, label: 'Needs Attention', color: 'amber' },
  { min: 20, label: 'At Risk', color: 'orange' },
  { min: 0, label: 'Critical', color: 'rose' },
] as const;

// ── Pagination Defaults ───────────────────────────────────
export const ANALYTICS_DEFAULTS = {
  pageSize: 20,
  maxCompaniesDisplay: 20,
  maxStudentsDisplay: 50,
  maxDrivesDisplay: 20,
  cacheStaleTimeMs: 60_000,
  maxApplicationsPerStudent: 5,
} as const;
