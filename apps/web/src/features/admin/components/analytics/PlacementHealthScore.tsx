import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { HealthScoreResponse } from '@/types/analytics.types';

const colorMap: Record<string, { ring: string; text: string; bg: string; grad: string[] }> = {
  emerald: {
    ring: '#10b981',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    grad: ['#34d399', '#10b981'],
  },
  blue: {
    ring: '#3b82f6',
    text: 'text-blue-400',
    bg: 'bg-blue-500/15',
    grad: ['#60a5fa', '#3b82f6'],
  },
  amber: {
    ring: '#f59e0b',
    text: 'text-amber-400',
    bg: 'bg-amber-500/15',
    grad: ['#fbbf24', '#f59e0b'],
  },
  orange: {
    ring: '#f97316',
    text: 'text-orange-400',
    bg: 'bg-orange-500/15',
    grad: ['#fb923c', '#f97316'],
  },
  rose: {
    ring: '#f43f5e',
    text: 'text-rose-400',
    bg: 'bg-rose-500/15',
    grad: ['#fb7185', '#f43f5e'],
  },
};

function RadialGauge({ value, color }: { value: number; color: string }) {
  const size = 180;
  const strokeW = 14;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const arcFraction = 0.75;
  const dashTotal = circ * arcFraction;
  const pct = Math.min(value / 100, 1);
  const fill = dashTotal * pct;
  const gradId = `healthGaugeGrad-${color}`;
  const colors = colorMap[color] || colorMap.blue!;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeW}
          strokeDasharray={`${dashTotal} ${circ}`}
          strokeLinecap="round"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${dashTotal} ${circ}`}
          initial={{ strokeDashoffset: dashTotal }}
          animate={{ strokeDashoffset: dashTotal - fill }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
        />
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.grad[0]} />
            <stop offset="100%" stopColor={colors.grad[1]} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-black tabular-nums leading-none text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {value.toFixed(0)}
        </motion.span>
        <span className={`text-sm font-bold ${colors.text} leading-none mt-1`}>/ 100</span>
      </div>
    </div>
  );
}

export default function PlacementHealthScore({ data }: { data: HealthScoreResponse }) {
  if (!data) return null;

  const colors = colorMap[data.color] || colorMap.blue!;

  return (
    <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
      {/* Glow */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
        style={{ background: `${colors.ring}10` }}
      />

      <div className="relative z-10">
        <div className="flex items-start gap-3 mb-6">
          <div
            className={`p-2 rounded-xl ring-1 shrink-0 mt-0.5 ${colors.bg}`}
            style={{ '--tw-ring-color': `${colors.ring}30` } as any}
          >
            <ShieldCheck className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold leading-tight">Placement Health Score</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Composite score across 6 dimensions
            </p>
          </div>
          <div className="shrink-0 ml-auto">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black ${colors.bg} ${colors.text}`}
            >
              {data.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Gauge */}
          <div className="shrink-0">
            <RadialGauge value={data.totalScore} color={data.color} />
          </div>

          {/* Components Breakdown */}
          <div className="flex-1 w-full space-y-3">
            {data.components.map((comp, i) => {
              const pct = comp.maxScore > 0 ? (comp.score / comp.maxScore) * 100 : 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <span className="text-xs font-semibold text-slate-400 w-24 sm:w-36 shrink-0 truncate">
                    {comp.label}
                  </span>
                  <div className="flex-1 min-w-[2rem] h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${colors.grad[0]}, ${colors.grad[1]})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-300 tabular-nums w-16 text-right">
                    {comp.score.toFixed(1)} / {comp.maxScore}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
