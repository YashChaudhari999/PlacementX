import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Building2, IndianRupee, Zap } from 'lucide-react';
import { Card } from '@/components/ui';
import { motion } from 'framer-motion';

const fmt = (n: number, d = 1) => Number(n).toFixed(d); // v3 – formats numbers to fixed decimals


// ── Radial Gauge ─────────────────────────────────────────
function RadialGauge({ value, max = 100 }: { value: number; max?: number }) {
  const size = 160;
  const strokeW = 12;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  // Only use 270° arc (¾ circle), start from bottom-left
  const arcFraction = 0.75;
  const dashTotal = circ * arcFraction;
  const pct = Math.min(value / max, 1);
  const fill = dashTotal * pct;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeW}
          strokeDasharray={`${dashTotal} ${circ}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${dashTotal} ${circ}`}
          initial={{ strokeDashoffset: dashTotal }}
          animate={{ strokeDashoffset: dashTotal - fill }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tabular-nums leading-none text-white">
          {fmt(value)}
        </span>
        <span className="text-sm font-bold text-indigo-300 leading-none mt-0.5">%</span>
      </div>
    </div>
  );
}

// ── Mini Stat Tile ────────────────────────────────────────
function StatTile({
  label, value, unit, icon: Icon, accent = 'indigo', delay = 0
}: {
  label: string; value: string | number; unit?: string;
  icon: any; accent?: string; delay?: number;
}) {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber:  'text-amber-400  bg-amber-500/10  border-amber-500/20',
    rose:   'text-rose-400   bg-rose-500/10   border-rose-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
      className={`rounded-xl p-3.5 border backdrop-blur-sm ${colors[accent]}`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5 opacity-80" />
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black tabular-nums leading-none">{value}</span>
        {unit && <span className="text-xs font-semibold opacity-60 leading-none">{unit}</span>}
      </div>
    </motion.div>
  );
}

// ── Insight Row ───────────────────────────────────────────
function InsightRow({ text, delay }: { text: string; delay: number }) {
  const isPos = /increased|improved|growth|higher|more/i.test(text);
  const isNeg = /dropped|risk|lower|less|declined/i.test(text);
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-start gap-3 py-2.5 border-b border-slate-700/40 last:border-0"
    >
      <div className={`mt-0.5 shrink-0 p-1 rounded-md ${
        isPos && !isNeg ? 'bg-emerald-500/15 text-emerald-400'
        : isNeg ? 'bg-rose-500/15 text-rose-400'
        : 'bg-blue-500/15 text-blue-400'
      }`}>
        {isPos && !isNeg
          ? <TrendingUp className="w-3.5 h-3.5" />
          : isNeg
          ? <AlertTriangle className="w-3.5 h-3.5" />
          : <CheckCircle2 className="w-3.5 h-3.5" />}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
    </motion.li>
  );
}

// ── Main Component ────────────────────────────────────────
export default function AiInsightsPanel({ data }: { data: any }) {
  if (!data) return null;
  const { insights = [], predictions = {} } = data;

  const pct      = Number(predictions.placementPercentage ?? 0);
  const avgPkg   = Number(predictions.averagePackage ?? 0);
  const highPkg  = Number(predictions.highestPackage ?? 0);
  const companies= Math.round(Number(predictions.expectedCompanies ?? 0));
  const trend    = String(predictions.trend ?? 'STABLE');
  const atRisk   = String(predictions.atRisk ?? '—');
  const isUp     = trend === 'UPWARD';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

      {/* ── Left: Insights ──────────────────────────────── */}
      <Card className="lg:col-span-2 p-6 bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
        {/* Glow blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-10 w-40 h-40 bg-purple-600/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-indigo-500/20 rounded-xl ring-1 ring-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Placement Insights</h2>
              <p className="text-xs text-slate-500 font-medium">Detected patterns from historical placement data</p>
            </div>
          </div>

          <ul className="divide-y divide-slate-700/30">
            {insights.map((text: string, i: number) => (
              <InsightRow key={i} text={text} delay={i * 0.07} />
            ))}
          </ul>
        </div>
      </Card>

      {/* ── Right: Predictive Forecast ───────────────────── */}
      <Card className="p-0 bg-transparent border-0 shadow-none overflow-visible">
        {/* Outer gradient shell */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1e1b4b] via-[#1a1040] to-[#0f0a1e] border border-indigo-700/30 shadow-2xl shadow-indigo-950/60 h-full">

          {/* Decorative orbs */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 ring-1 ring-purple-500/30">
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">Predictive Forecast</h2>
                  <p className="text-[10px] text-indigo-400/70 font-semibold tracking-wider uppercase">ML · 2026</p>
                </div>
              </div>
              {/* Trend badge */}
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                isUp
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {trend}
              </div>
            </div>

            {/* Radial gauge + label */}
            <div className="flex flex-col items-center py-2">
              <RadialGauge value={pct} />
              <p className="text-[11px] text-indigo-300/70 font-semibold uppercase tracking-widest mt-2">
                Placement Rate
              </p>
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-white/8" />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2.5 flex-1">
              <StatTile
                label="Highest Pkg"
                value={fmt(highPkg)}
                unit="LPA"
                icon={IndianRupee}
                accent="indigo"
                delay={0.1}
              />
              <StatTile
                label="Avg Package"
                value={fmt(avgPkg)}
                unit="LPA"
                icon={IndianRupee}
                accent="purple"
                delay={0.2}
              />
              <StatTile
                label="Companies"
                value={companies}
                icon={Building2}
                accent="emerald"
                delay={0.3}
              />
              <StatTile
                label="At Risk"
                value={atRisk}
                icon={AlertTriangle}
                accent="rose"
                delay={0.4}
              />
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
