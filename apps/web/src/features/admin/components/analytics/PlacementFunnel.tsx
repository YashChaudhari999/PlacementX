import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import {
  Filter,
  Users,
  UserCheck,
  Search,
  Briefcase,
  FileCheck,
  XCircle,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import type { FunnelResponse } from '@/types/analytics.types';

const stageIcons: Record<string, React.ElementType> = {
  APPLIED: Users,
  SHORTLISTED: Search,
  INTERVIEWED: UserCheck,
  OFFERED: Briefcase,
  REJECTED: XCircle,
};

const stageColors: Record<string, string> = {
  APPLIED: 'bg-blue-500',
  SHORTLISTED: 'bg-indigo-500',
  INTERVIEWED: 'bg-violet-500',
  OFFERED: 'bg-emerald-500',
  REJECTED: 'bg-rose-500',
};

export default function PlacementFunnel({ data }: { data: FunnelResponse }) {
  if (!data?.stages?.length) {
    return (
      <Card className="p-6 border-slate-200 flex flex-col items-center justify-center min-h-[300px] text-slate-500">
        <Filter className="w-8 h-8 mb-3 opacity-20" />
        <p>No funnel data available for selected filters</p>
      </Card>
    );
  }

  const maxCount = Math.max(...data.stages.map((s) => s.count), 1);

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
          <Filter className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Application Funnel</h2>
          <p className="text-xs text-slate-500">Conversion across selection stages</p>
        </div>
      </div>

      {data.insight?.largestDrop && (
        <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">Significant Drop Detected</h4>
            <p className="text-sm text-amber-700 mt-1">{data.insight.description}</p>
            {data.insight.recommendation && (
              <p className="text-sm font-medium text-amber-800 mt-2">
                {data.insight.recommendation}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {data.stages.map((stage, idx) => {
          const Icon = stageIcons[stage.stage] || FileCheck;
          const color = stageColors[stage.stage] || 'bg-slate-500';
          const width = Math.max((stage.count / maxCount) * 100, 2);

          return (
            <div key={stage.stage} className="relative">
              {/* Conversion indicator from previous stage */}
              {idx > 0 && stage.conversionFromPrevious !== null && (
                <div className="absolute -top-5 left-10 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <div className="w-px h-6 bg-slate-200" />
                  <ChevronRight className="w-3 h-3" />
                  <span className={stage.conversionFromPrevious < 30 ? 'text-rose-500' : ''}>
                    {stage.conversionFromPrevious.toFixed(1)}% conversion
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm ${color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {stage.stage}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">
                        {stage.count.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-slate-500 ml-2">
                        ({stage.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
