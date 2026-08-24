import api from '../lib/api';
import type {
  AnalyticsFilters,
  FilterOptions,
  OverviewResponse,
  HealthScoreResponse,
  FunnelResponse,
  DepartmentResponse,
  CompanyResponse,
  SalaryResponse,
  StudentRiskResponse,
  SkillGapResponse,
  DriveAnalyticsResponse,
  InsightsResponse,
  ActionCenterResponse,
  OperationalHealth,
  YearComparisonRow,
  ForecastResponse,
} from '../types/analytics.types';

const BASE = '/admin/analytics';

function toParams(filters?: AnalyticsFilters): Record<string, string> {
  if (!filters) return {};
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });
  return params;
}

export const analyticsService = {
  // ── Filter Options ────────────────────────────────────────
  getFilterOptions: async (): Promise<FilterOptions> => {
    const { data } = await api.get(`${BASE}/placement/filter-options`);
    return data;
  },

  // ── Overview ──────────────────────────────────────────────
  getOverview: async (params?: AnalyticsFilters): Promise<OverviewResponse> => {
    const { data } = await api.get(`${BASE}/placement/overview`, { params: toParams(params) });
    return data;
  },

  // ── Health Score ──────────────────────────────────────────
  getHealthScore: async (params?: AnalyticsFilters): Promise<HealthScoreResponse> => {
    const { data } = await api.get(`${BASE}/placement/health-score`, { params: toParams(params) });
    return data;
  },

  // ── Funnel ────────────────────────────────────────────────
  getFunnel: async (params?: AnalyticsFilters): Promise<FunnelResponse> => {
    const { data } = await api.get(`${BASE}/placement/funnel`, { params: toParams(params) });
    return data;
  },

  // ── Departments ───────────────────────────────────────────
  getDepartments: async (params?: AnalyticsFilters): Promise<DepartmentResponse> => {
    const { data } = await api.get(`${BASE}/placement/departments`, { params: toParams(params) });
    return data;
  },

  // ── Companies ─────────────────────────────────────────────
  getCompanies: async (params?: AnalyticsFilters): Promise<CompanyResponse> => {
    const { data } = await api.get(`${BASE}/placement/companies`, { params: toParams(params) });
    return data;
  },

  // ── Packages / Salary ─────────────────────────────────────
  getPackages: async (params?: AnalyticsFilters): Promise<SalaryResponse> => {
    const { data } = await api.get(`${BASE}/placement/packages`, { params: toParams(params) });
    return data;
  },

  // ── Year Comparison ───────────────────────────────────────
  getYearComparison: async (params?: AnalyticsFilters): Promise<YearComparisonRow[]> => {
    const { data } = await api.get(`${BASE}/placement/year-comparison`, { params: toParams(params) });
    return data;
  },

  // ── Student Risk / Readiness ──────────────────────────────
  getStudentRisk: async (params?: AnalyticsFilters): Promise<StudentRiskResponse> => {
    const { data } = await api.get(`${BASE}/placement/students`, { params: toParams(params) });
    return data;
  },

  // ── Skill Gap ─────────────────────────────────────────────
  getSkillGap: async (params?: AnalyticsFilters): Promise<SkillGapResponse> => {
    const { data } = await api.get(`${BASE}/placement/skills`, { params: toParams(params) });
    return data;
  },

  // ── Drive Analytics ───────────────────────────────────────
  getDriveAnalytics: async (params?: AnalyticsFilters): Promise<DriveAnalyticsResponse> => {
    const { data } = await api.get(`${BASE}/placement/drives`, { params: toParams(params) });
    return data;
  },

  // ── Intelligence Insights ─────────────────────────────────
  getIntelligence: async (params?: AnalyticsFilters): Promise<InsightsResponse> => {
    const { data } = await api.get(`${BASE}/placement/intelligence`, { params: toParams(params) });
    return data;
  },

  // ── Action Center ─────────────────────────────────────────
  getActionCenter: async (params?: AnalyticsFilters): Promise<ActionCenterResponse> => {
    const { data } = await api.get(`${BASE}/placement/action-center`, { params: toParams(params) });
    return data;
  },

  // ── Operational Health ────────────────────────────────────
  getOperational: async (): Promise<OperationalHealth> => {
    const { data } = await api.get(`${BASE}/placement/operational`);
    return data;
  },

  // ── ML Forecast ───────────────────────────────────────────
  getForecast: async (params?: AnalyticsFilters): Promise<ForecastResponse> => {
    const { data } = await api.get(`${BASE}/placement/forecast`, { params: toParams(params) });
    return data;
  },

  // ── Export ────────────────────────────────────────────────
  exportExcel: async (params?: AnalyticsFilters): Promise<Blob> => {
    const { data } = await api.get(`${BASE}/export/excel`, {
      params: toParams(params),
      responseType: 'blob',
    });
    return data;
  },
};
