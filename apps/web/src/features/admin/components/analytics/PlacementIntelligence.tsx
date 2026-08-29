import { Card } from '@/components/ui';
import {
  Lightbulb,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';
import type { InsightsResponse, PlacementInsight, InsightSeverity } from '@/types/analytics.types';

const severityIcons: Record<InsightSeverity, React.ElementType> = {
  CRITICAL: AlertTriangle,
  HIGH: AlertTriangle,
  MEDIUM: Info,
  LOW: Info,
  POSITIVE: ArrowUpRight,
  OPPORTUNITY: Lightbulb,
};

const severityStyles: Record<InsightSeverity, string> = {
  CRITICAL: 'bg-rose-50 border-rose-200 text-rose-800',
  HIGH: 'bg-orange-50 border-orange-200 text-orange-800',
  MEDIUM: 'bg-amber-50 border-amber-200 text-amber-800',
  LOW: 'bg-slate-50 border-slate-200 text-slate-800',
  POSITIVE: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  OPPORTUNITY: 'bg-indigo-50 border-indigo-200 text-indigo-800',
};

const severityIconColors: Record<InsightSeverity, string> = {
  CRITICAL: 'text-rose-600',
  HIGH: 'text-orange-600',
  MEDIUM: 'text-amber-600',
  LOW: 'text-slate-600',
  POSITIVE: 'text-emerald-600',
  OPPORTUNITY: 'text-indigo-600',
};

export default function PlacementIntelligence({ data }: { data: InsightsResponse }) {
  if (!data?.insights?.length) return null;

  const { insights, summary } = data;

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Placement Intelligence</h2>
            <p className="text-xs text-slate-500">Automated insights and anomaly detection</p>
          </div>
        </div>

        <div className="flex gap-2">
          {summary.critical > 0 && (
            <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg">
              {summary.critical} Critical
            </span>
          )}
          {summary.positive > 0 && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
              {summary.positive} Positive
            </span>
          )}
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
            {summary.total} Total
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {insights.map((insight: PlacementInsight) => {
          const Icon = severityIcons[insight.severity];
          const style = severityStyles[insight.severity];
          const iconColor = severityIconColors[insight.severity];

          return (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border ${style} flex flex-col md:flex-row gap-4`}
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                <div>
                  <h4 className="font-bold mb-1">{insight.title}</h4>
                  <p className="text-sm opacity-90">{insight.description}</p>

                  {insight.recommendedAction && (
                    <div className="mt-3 text-sm font-medium opacity-90 flex items-start gap-1.5">
                      <ArrowUpRight className="w-4 h-4 mt-0.5 shrink-0" />
                      {insight.recommendedAction}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:w-48 shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-current/10 pt-3 md:pt-0 md:pl-4">
                <div className="text-left md:text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
                    {insight.metric}
                  </div>
                  <div className="font-black text-lg">{insight.currentValue}</div>
                  {insight.gap !== null && (
                    <div className="text-xs font-bold flex items-center md:justify-end gap-1 mt-0.5 opacity-80">
                      {insight.gap > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : insight.gap < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      {Math.abs(insight.gap).toFixed(1)} {insight.gap > 0 ? 'above' : 'below'}{' '}
                      benchmark
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
