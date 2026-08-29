import { Card } from '@/components/ui';
import { Target01Icon, ArrowRight01Icon, Alert01Icon, InformationCircleIcon } from 'hugeicons-react';
import type { ActionCenterResponse, ActionItem } from '@/types/analytics.types';
import { Link } from 'react-router-dom';

export default function ActionCenter({ data }: { data: ActionCenterResponse }) {
  if (!data?.actions?.length) {
    return (
      <Card className="p-6 border-slate-200 flex flex-col items-center justify-center min-h-[200px] text-slate-500">
        <Target01Icon className="w-8 h-8 mb-3 opacity-20" />
        <p>No immediate actions required</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
          <Target01Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Action Center</h2>
          <p className="text-xs text-slate-500">Prioritized recommendations requiring attention</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.actions.map((action: ActionItem, idx: number) => {
          const isCritical = action.priority === 'CRITICAL' || action.priority === 'HIGH';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isCritical
                  ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/50'
                  : 'bg-amber-50 border-amber-200 hover:bg-amber-100/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 shrink-0 ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}
                >
                  {isCritical ? (
                    <Alert01Icon className="w-5 h-5" />
                  ) : (
                    <InformationCircleIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold ${isCritical ? 'text-rose-900' : 'text-amber-900'}`}>
                      {action.problem}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        isCritical ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {action.priority}
                    </span>
                  </div>

                  <p className={`text-sm mb-2 ${isCritical ? 'text-rose-700' : 'text-amber-700'}`}>
                    {action.evidence}
                  </p>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-md ${
                        isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Action: {action.recommendedAction}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 sm:self-stretch flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 sm:border-l border-current/10 pt-3 sm:pt-0 sm:pl-4">
                {/* Provide contextual links based on category */}
                {action.category === 'OPERATIONS' && action.problem.includes('Verification') && (
                  <Link
                    to="/admin/students?tab=pending"
                    className={`inline-flex items-center gap-1 text-sm font-bold transition-colors ${
                      isCritical
                        ? 'text-rose-600 hover:text-rose-700'
                        : 'text-amber-600 hover:text-amber-700'
                    }`}
                  >
                    Review Profiles <ArrowRight01Icon className="w-4 h-4" />
                  </Link>
                )}
                {action.category === 'OPERATIONS' && action.problem.includes('Drives') && (
                  <Link
                    to="/admin/placement-events?tab=pending"
                    className={`inline-flex items-center gap-1 text-sm font-bold transition-colors ${
                      isCritical
                        ? 'text-rose-600 hover:text-rose-700'
                        : 'text-amber-600 hover:text-amber-700'
                    }`}
                  >
                    Review Drives <ArrowRight01Icon className="w-4 h-4" />
                  </Link>
                )}
                {action.category !== 'OPERATIONS' && (
                  <button
                    className={`inline-flex items-center gap-1 text-sm font-bold transition-colors ${
                      isCritical
                        ? 'text-rose-600 hover:text-rose-700'
                        : 'text-amber-600 hover:text-amber-700'
                    }`}
                  >
                    Investigate <ArrowRight01Icon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
