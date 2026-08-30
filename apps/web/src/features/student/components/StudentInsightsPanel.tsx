import { useState } from 'react';
import { Card } from '@/components/ui';
import {
  Target01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Alert02Icon,
  SparklesIcon,
  TickDouble02Icon,
} from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MLPrediction {
  predictedSuccessRate: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  topFactors?: Array<{ feature: string; impact: 'positive' | 'negative' }>;
  modelVersion?: string;
}

export default function StudentInsightsPanel({ prediction }: { prediction?: MLPrediction | null }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!prediction) return null;

  const { predictedSuccessRate, riskLevel, topFactors = [], modelVersion } = prediction;
  const rate = typeof predictedSuccessRate === 'number' ? predictedSuccessRate : 0;

  const riskConfig = {
    LOW: {
      label: 'LOW RISK',
      bgClass: 'bg-emerald-500/20',
      textClass: 'text-emerald-300',
      borderClass: 'border-emerald-500/30',
      barClass: 'from-emerald-400 to-teal-500',
      Icon: TickDouble02Icon,
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      bgClass: 'bg-amber-500/20',
      textClass: 'text-amber-300',
      borderClass: 'border-amber-500/30',
      barClass: 'from-amber-400 to-orange-500',
      Icon: Alert02Icon,
    },
    HIGH: {
      label: 'HIGH RISK',
      bgClass: 'bg-rose-500/20',
      textClass: 'text-rose-300',
      borderClass: 'border-rose-500/30',
      barClass: 'from-rose-400 to-red-500',
      Icon: Alert02Icon,
    },
  };

  const config = riskConfig[riskLevel] ?? riskConfig.MEDIUM;
  const { Icon: RiskIcon } = config;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className="mb-6"
    >
      <Card className="p-6 bg-gradient-to-r from-indigo-900 via-violet-900 to-indigo-950 text-white border-indigo-800/50 shadow-xl shadow-indigo-900/20 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
          <Target01Icon className="w-56 h-56" />
        </div>
        <div className="absolute -left-8 -bottom-8 opacity-5 pointer-events-none">
          <SparklesIcon className="w-40 h-40" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Left: Title + progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/30 rounded-xl ring-1 ring-blue-400/30">
                <SparklesIcon className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Placement Readiness Score</h2>
                <p className="text-xs text-blue-300 font-medium">
                  AI-powered analysis of your profile
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-blue-300 font-medium">Success Likelihood</span>
                <span className="text-xs text-blue-300 font-bold">{rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(rate, 100)}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${config.barClass} rounded-full`}
                />
                {rate >= 95 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-0 right-0 w-8 h-full bg-white/40 blur-[2px] rounded-full"
                  />
                )}
              </div>
            </div>

            {/* Actionable Insights Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-indigo-300 hover:text-white transition-colors flex items-center gap-1 bg-indigo-900/50 px-3 py-1.5 rounded-full border border-indigo-700/50"
            >
              <SparklesIcon className="w-3 h-3" />
              {isExpanded ? 'Hide tips' : 'How to boost your score'}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-800/30 text-xs text-indigo-200 space-y-2">
                    <p className="font-bold text-white mb-1">Recommended Actions:</p>
                    <ul className="list-disc pl-4 space-y-1.5">
                      {topFactors?.filter((f) => f.impact === 'negative').length > 0 ? (
                        topFactors
                          .filter((f) => f.impact === 'negative')
                          .map((f, i) => (
                            <li key={i}>
                              Improve{' '}
                              <strong className="text-white">
                                {f.feature.replace(/_/g, ' ').toLowerCase()}
                              </strong>{' '}
                              to increase your score
                            </li>
                          ))
                      ) : (
                        <>
                          <li>
                            Add your GitHub Profile Link{' '}
                            <span className="text-emerald-400 font-semibold">(+5%)</span>
                          </li>
                          <li>
                            Update your latest semester CGPA{' '}
                            <span className="text-emerald-400 font-semibold">(+2%)</span>
                          </li>
                          <li>
                            Upload a more recent resume{' '}
                            <span className="text-emerald-400 font-semibold">(+3%)</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Factors */}
            {topFactors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {topFactors.map((f, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      f.impact === 'positive'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                    }`}
                  >
                    {f.impact === 'positive' ? (
                      <ArrowUp01Icon className="w-3 h-3" />
                    ) : (
                      <ArrowDown01Icon className="w-3 h-3" />
                    )}
                    {f.feature}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Score + risk pill */}
          <div className="flex items-center gap-4 shrink-0 bg-black/20 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-1">
                Score
              </p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-black">{rate.toFixed(0)}</span>
                <span className="text-lg font-bold text-blue-300 mb-0.5">%</span>
              </div>
            </div>

            <div className="w-px h-12 bg-white/10" />

            <div className="text-center">
              <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-2">
                Risk
              </p>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${config.bgClass} ${config.textClass} ${config.borderClass}`}
              >
                <RiskIcon className="w-3.5 h-3.5" />
                {config.label}
              </div>
              {modelVersion && (
                <p className="text-[10px] text-blue-400/60 mt-1.5 font-mono">v{modelVersion}</p>
              )}
            </div>
          </div>
        </div>

        {/* Advice banner for HIGH risk */}
        {riskLevel === 'HIGH' && (
          <div className="relative z-10 mt-4 border-t border-white/10 pt-4">
            <p className="text-xs text-rose-300 flex items-center gap-2">
              <Alert02Icon className="w-4 h-4 shrink-0" />
              Complete your profile, add more skills, and apply to active drives to improve your
              score.
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
