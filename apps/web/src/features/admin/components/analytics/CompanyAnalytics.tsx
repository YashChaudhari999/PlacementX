import { Card } from '@/components/ui';
import { Building2, IndianRupee, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CompanyResponse } from '@/types/analytics.types';
import { useState } from 'react';

export default function CompanyAnalytics({ data }: { data: CompanyResponse }) {
  const [showAll, setShowAll] = useState(false);

  if (!data?.topCompanies?.length) return null;

  const displayCompanies = showAll ? data.topCompanies : data.topCompanies.slice(0, 10);

  const retention = data.retention;

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recruiter Intelligence</h2>
            <p className="text-xs text-slate-500">Top hiring companies and retention rates</p>
          </div>
        </div>

        {retention && (
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                {retention.returningCount}
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Returning</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                {retention.newCount}
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">New</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                {retention.lostCount}
                <TrendingDown className="w-3 h-3 text-rose-500" />
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Lost</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {displayCompanies.map((company, idx) => (
          <div key={company.companyName} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
            <div className="flex items-center gap-4 min-w-[240px]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                #{idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{company.companyName}</h4>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {company.departments.join(', ')}
                </p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Offers
                </div>
                <div className="font-black text-slate-900">{company.offers}</div>
              </div>
              
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> Avg Pkg
                </div>
                <div className="font-bold text-emerald-600">₹{company.averagePackage.toFixed(2)}L</div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> High Pkg
                </div>
                <div className="font-bold text-indigo-600">₹{company.highestPackage.toFixed(2)}L</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.topCompanies.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
        >
          {showAll ? 'Show Top 10' : `Show All ${data.topCompanies.length} Companies`}
        </button>
      )}
    </Card>
  );
}
