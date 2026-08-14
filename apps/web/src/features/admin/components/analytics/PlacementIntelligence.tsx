import { Card } from '@/components/ui';
import { Lightbulb, AlertTriangle, CheckCircle2, TrendingUp, Target } from 'lucide-react';

export default function PlacementIntelligence({ intelligence }: { intelligence: any }) {
  if (!intelligence) return null;

  const { insights, risks, recommendations } = intelligence;

  if (insights?.length === 0 && risks?.length === 0 && recommendations?.length === 0) return null;

  return (
    <div className="space-y-6">
      
      {/* Key Insights & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800">Key Insights</h3>
          </div>
          
          <ul className="space-y-4">
            {insights?.length > 0 ? insights.map((insight: any, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {insight.type === 'improvement' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                  {insight.type === 'strong' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {insight.type === 'growth' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                  {(!insight.type || insight.type === 'info') && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </div>
                <p className="text-sm text-slate-700 font-medium">{insight.text}</p>
              </li>
            )) : (
              <li className="text-sm text-slate-500 italic">No significant insights detected for this period.</li>
            )}
          </ul>
        </Card>

        <Card className="p-6 border-slate-200 border-t-4 border-t-rose-500">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-800">Placement Risks</h3>
          </div>
          
          <ul className="space-y-4">
            {risks?.length > 0 ? risks.map((risk: any, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-sm text-slate-700 font-medium">{risk.text}</p>
              </li>
            )) : (
              <li className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> No significant risks detected.
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* Recommended Actions */}
      {recommendations?.length > 0 && (
        <Card className="p-6 border-indigo-200 bg-indigo-50/30">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-indigo-900">Recommended Actions</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec: any, i: number) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700 font-medium">{rec.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}
