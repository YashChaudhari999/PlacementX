import { Card } from '@/components/ui';
import { BookOpen, AlertCircle, CheckCircle2, Minus } from 'lucide-react';
import type { SkillGapResponse } from '@/types/analytics.types';

export default function SkillGapAnalytics({ data }: { data: SkillGapResponse }) {
  if (!data?.skills?.length) {
    return (
      <Card className="p-6 border-slate-200 flex flex-col items-center justify-center min-h-[200px] text-slate-500">
        <BookOpen className="w-8 h-8 mb-3 opacity-20" />
        <p>Insufficient skill data for gap analysis</p>
      </Card>
    );
  }

  const { topShortages, recommendations } = data;

  return (
    <div className="space-y-4">
      {recommendations?.length > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900">Training Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-800">
                <span className="font-black mt-0.5">•</span>
                <span>{rec.recommendation}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Top Skill Shortages</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Where recruiter demand exceeds student supply
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {topShortages.map((skill) => (
            <div
              key={skill.skill}
              className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-1/3 min-w-[120px]">
                <div className="font-bold text-slate-900 truncate">{skill.skill}</div>
                <div className="text-xs text-rose-600 font-bold mt-0.5">
                  {Math.abs(skill.gap)} shortage
                </div>
              </div>

              <div className="flex-1 max-w-sm">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                  <span>Supply: {skill.studentSupply}</span>
                  <span>Demand: {skill.recruiterDemand}</span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${Math.min((skill.studentSupply / skill.recruiterDemand) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="w-24 text-right">
                <div className="text-lg font-black text-slate-900">{skill.coverage}%</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Coverage
                </div>
              </div>
            </div>
          ))}

          {topShortages.length === 0 && (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="font-medium text-slate-900">No Critical Shortages</p>
              <p className="text-sm">
                Student supply meets or exceeds recruiter demand for all tracked skills.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
