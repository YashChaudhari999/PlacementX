import { Card } from '@/components/ui';
import { Sparkles, TrendingUp, AlertTriangle, Building, GraduationCap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiInsightsPanel({ data }: { data: any }) {
  if (!data) return null;
  const { insights, predictions } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Insights List */}
      <Card className="lg:col-span-2 p-6 bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold">AI Placement Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {insights.map((insight: string, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
            >
              <div className="mt-0.5">
                {insight.includes('increased') || insight.includes('improved') || insight.includes('growth') ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : insight.includes('dropped') || insight.includes('risk') ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <p className="text-sm text-slate-300 leading-snug">{insight}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Predictive Analytics */}
      <Card className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-800/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold">Predictive Forecast</h2>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">Expected Final Placement</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{predictions.placementPercentage}%</span>
              <span className="text-sm text-emerald-400 font-bold pb-1 flex items-center"><TrendingUp className="w-4 h-4" /> {predictions.trend}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${predictions.placementPercentage}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              ></motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
            <div>
              <p className="text-xs text-indigo-300 font-medium mb-1">Expected Highest</p>
              <p className="text-xl font-bold">{predictions.highestPackage} LPA</p>
            </div>
            <div>
              <p className="text-xs text-indigo-300 font-medium mb-1">Expected Avg</p>
              <p className="text-xl font-bold">{predictions.averagePackage} LPA</p>
            </div>
            <div>
              <p className="text-xs text-indigo-300 font-medium mb-1">Est. Companies</p>
              <p className="text-xl font-bold">{predictions.expectedCompanies}</p>
            </div>
            <div>
              <p className="text-xs text-rose-300 font-medium mb-1">At Risk Dept.</p>
              <p className="text-sm font-bold text-rose-400 truncate">{predictions.atRisk}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Re-export Activity for the icon since I forgot to import it above
function Activity(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
}
