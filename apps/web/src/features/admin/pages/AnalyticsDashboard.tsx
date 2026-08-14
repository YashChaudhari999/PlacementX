import { useSearchParams } from 'react-router-dom';
import { AnalyticsSkeleton } from '@/components/common/Skeletons';
import GlobalFilters from '../components/analytics/GlobalFilters';
import AnalyticsKPIs from '../components/analytics/AnalyticsKPIs';
import AnalyticsCharts from '../components/analytics/AnalyticsCharts';
import AiInsightsPanel from '../components/analytics/AiInsightsPanel';
import { 
  useAnalyticsSummary, 
  useAnalyticsCharts,
  useAnalyticsAiInsights
} from '@/hooks/queries/useAnalytics';

export default function AnalyticsDashboard() {
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const { data: summary, isPending: summaryPending } = useAnalyticsSummary(params);
  const { data: charts, isPending: chartsPending } = useAnalyticsCharts(params);
  const { data: aiInsights, isPending: aiPending } = useAnalyticsAiInsights(params);

  const isPending = summaryPending || chartsPending || aiPending;

  if (isPending && (!summary || !charts)) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-12 space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Placement Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Deep insights and historical trends.</p>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <GlobalFilters />

      {isPending && <div className="text-sm text-indigo-600 animate-pulse font-medium">Refreshing data...</div>}

      <AiInsightsPanel data={aiInsights} />
      <AnalyticsKPIs summary={summary} />
      <AnalyticsCharts charts={charts} />
    </div>
  );
}
