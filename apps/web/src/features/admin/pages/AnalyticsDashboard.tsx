import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters';
import {
  useAnalyticsOverview,
  useHealthScore,
  useAnalyticsFunnel,
  useAnalyticsDepartments,
  useAnalyticsCompanies,
  useAnalyticsPackages,
  useAnalyticsYearComparison,
  useStudentRiskAnalytics,
  useSkillGapAnalytics,
  useDriveAnalytics,
  useAnalyticsIntelligence,
  useActionCenter,
  useOperationalHealth,
  useForecast
} from '@/hooks/queries/useAnalytics';

import GlobalFilters from '../components/analytics/GlobalFilters';
import AnalyticsKPIs from '../components/analytics/AnalyticsKPIs';
import PlacementHealthScore from '../components/analytics/PlacementHealthScore';
import ActionCenter from '../components/analytics/ActionCenter';
import PlacementIntelligence from '../components/analytics/PlacementIntelligence';
import OperationalHealth from '../components/analytics/OperationalHealth';
import PlacementFunnel from '../components/analytics/PlacementFunnel';
import DepartmentAnalytics from '../components/analytics/DepartmentAnalytics';
import DepartmentPerformanceChart from '../components/analytics/DepartmentPerformanceChart';
import CompanyAnalytics from '../components/analytics/CompanyAnalytics';
import SalaryAnalytics from '../components/analytics/SalaryAnalytics';
import StudentRiskAnalytics from '../components/analytics/StudentRiskAnalytics';
import SkillGapAnalytics from '../components/analytics/SkillGapAnalytics';
import DriveAnalytics from '../components/analytics/DriveAnalytics';
import YearComparisonChart from '../components/analytics/YearComparisonChart';
import ForecastChart from '../components/analytics/ForecastChart';

import { Activity, ShieldCheck, Target, GraduationCap, Building2, IndianRupee, Briefcase, Sparkles } from 'lucide-react';
import { AnalyticsSkeleton } from '@/components/common/Skeletons';

type Tab = 'overview' | 'departments' | 'students' | 'companies' | 'drives' | 'forecast';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { filters } = useAnalyticsFilters();

  // Overview / Foundation
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview(filters);
  const { data: healthScore } = useHealthScore(filters);
  const { data: actionCenter } = useActionCenter(filters);
  const { data: intelligence } = useAnalyticsIntelligence(filters);
  const { data: operational } = useOperationalHealth();

  // Core Analytics
  const { data: funnel } = useAnalyticsFunnel(filters);
  const { data: departments } = useAnalyticsDepartments(filters);
  const { data: companies } = useAnalyticsCompanies(filters);
  const { data: salary } = useAnalyticsPackages(filters);

  // Advanced Analytics
  const { data: studentRisk } = useStudentRiskAnalytics(filters);
  const { data: skillGap } = useSkillGapAnalytics(filters);
  const { data: drives } = useDriveAnalytics(filters);

  // Trends & Forecast
  const { data: yearComparison } = useAnalyticsYearComparison(filters);
  const { data: forecast } = useForecast(filters);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Command Center', icon: Activity },
    { id: 'students', label: 'Student Readiness', icon: GraduationCap },
    { id: 'departments', label: 'Department Intelligence', icon: Target },
    { id: 'companies', label: 'Recruiter Intelligence', icon: Building2 },
    { id: 'drives', label: 'Drive Analytics', icon: Briefcase },
    { id: 'forecast', label: 'AI Forecast', icon: Sparkles },
  ];

  if (overviewLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <AnalyticsSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* ── Premium Hero Header ──────────────────────── */}
      <div className="relative isolate overflow-hidden bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 via-slate-900 to-slate-900"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Placement Intelligence</h1>
            <p className="text-indigo-200/80 font-medium mt-2 max-w-xl text-sm sm:text-base">
              AI-driven insights and operational decision support for your campus placements.
            </p>
          </div>
        </div>
      </div>

      <div className="px-1">
        <GlobalFilters />
      </div>

      {/* ── Tab Navigation ──────────────────────── */}
      <div className="flex overflow-x-auto hide-scrollbar py-2">
        <div className="flex gap-2 min-w-max p-1 bg-slate-100 rounded-2xl">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all relative ${
                  isActive 
                    ? 'text-indigo-700 bg-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {activeTab === 'overview' && (
            <>
              {overview && <AnalyticsKPIs data={overview} />}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {actionCenter && <ActionCenter data={actionCenter} />}
                  {intelligence && <PlacementIntelligence data={intelligence} />}
                </div>
                <div className="space-y-6">
                  {healthScore && <PlacementHealthScore data={healthScore} />}
                  {operational && <OperationalHealth data={operational} />}
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              {studentRisk && <StudentRiskAnalytics data={studentRisk} />}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {skillGap && <SkillGapAnalytics data={skillGap} />}
                {funnel && <PlacementFunnel data={funnel} />}
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-6">
              {departments && <DepartmentPerformanceChart data={departments} />}
              {departments && <DepartmentAnalytics data={departments} />}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-6">
              {companies && <CompanyAnalytics data={companies} />}
              {salary && <SalaryAnalytics data={salary} />}
            </div>
          )}

          {activeTab === 'drives' && (
            <div className="space-y-6">
              {drives && <DriveAnalytics data={drives} />}
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {forecast && <ForecastChart data={forecast} />}
                {yearComparison && <YearComparisonChart data={yearComparison} />}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
