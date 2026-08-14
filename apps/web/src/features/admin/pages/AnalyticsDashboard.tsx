import { useSearchParams } from 'react-router-dom';
import { AnalyticsSkeleton } from '@/components/common/Skeletons';
import GlobalFilters from '../components/analytics/GlobalFilters';
import AnalyticsKPIs from '../components/analytics/AnalyticsKPIs';
import AnalyticsCharts from '../components/analytics/AnalyticsCharts';
import PlacementIntelligence from '../components/analytics/PlacementIntelligence';
import DepartmentHeatmap from '../components/analytics/DepartmentHeatmap';
import PlacementFunnel from '../components/analytics/PlacementFunnel';
import PackageDistribution from '../components/analytics/PackageDistribution';
import { 
  useAnalyticsOverview, 
  useAnalyticsDepartments,
  useAnalyticsYearComparison,
  useAnalyticsPackages,
  useAnalyticsFunnel,
  useAnalyticsIntelligence
} from '@/hooks/queries/useAnalytics';

export default function AnalyticsDashboard() {
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const { data: overview, isPending: overviewPending } = useAnalyticsOverview(params);
  const { data: departments, isPending: departmentsPending } = useAnalyticsDepartments(params);
  const { data: yearComparison, isPending: yearComparisonPending } = useAnalyticsYearComparison(params);
  const { data: packages, isPending: packagesPending } = useAnalyticsPackages(params);
  const { data: funnel, isPending: funnelPending } = useAnalyticsFunnel(params);
  const { data: intelligence, isPending: intelligencePending } = useAnalyticsIntelligence(params);

  const isPending = overviewPending || departmentsPending || yearComparisonPending || packagesPending || funnelPending || intelligencePending;

  // We only show full skeleton on initial load if we have no data
  if (isPending && (!overview || !departments)) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-12 space-y-8">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Placement Intelligence</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Deep insights, historical trends, and decision-making metrics.</p>
        </div>
        <div className="text-xs font-semibold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <GlobalFilters />

      {isPending && (
        <div className="text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center justify-center animate-pulse font-medium">
          Recalculating intelligence models based on new filters...
        </div>
      )}

      {/* 1. KPIs */}
      <AnalyticsKPIs overview={overview} />

      {/* 2. Charts & Trends */}
      <AnalyticsCharts overview={overview} departments={departments} yearComparison={yearComparison} />

      {/* 3. Heatmap & Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DepartmentHeatmap departments={departments} />
        <PlacementFunnel funnelData={funnel} />
      </div>

      {/* 4. Package Distribution */}
      <PackageDistribution packages={packages} />

      {/* 5. Intelligence Engine */}
      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Decision Intelligence Engine</h2>
        <PlacementIntelligence intelligence={intelligence} />
      </div>
      
    </div>
  );
}
