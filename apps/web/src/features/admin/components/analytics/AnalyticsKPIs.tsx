import { Card } from '@/components/ui';
import { UserMultipleIcon, Mortarboard01Icon, Money01Icon, Building02Icon, Briefcase01Icon, ArrowUp01Icon, ArrowDown01Icon, MinusSignIcon, Note01Icon, Target01Icon, Award01Icon } from 'hugeicons-react';
import type { OverviewResponse } from '@/types/analytics.types';

const fmt = (n: number | null | undefined) => (n != null ? n.toLocaleString('en-IN') : '—');

const fmtPct = (n: number | null | undefined) => (n != null ? `${n.toFixed(1)}%` : '—');

const fmtLpa = (n: number | null | undefined) => (n != null ? `₹${n.toFixed(2)} L` : '—');

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  change?: number | null;
  changeLabel?: string;
  tooltip?: string;
  size?: 'default' | 'large';
}

function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  change,
  changeLabel,
  tooltip,
  size = 'default',
}: KPICardProps) {
  const isPositive = change != null && change > 0;
  const isNegative = change != null && change < 0;
  const isNeutral = change != null && change === 0;

  return (
    <Card
      className={`p-5 border-slate-200 hover:shadow-md transition-shadow group relative ${
        size === 'large' ? 'col-span-1 md:col-span-2 lg:col-span-1' : ''
      }`}
    >
      {tooltip && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-[10px] text-slate-400 bg-slate-50 rounded-md px-2 py-1 max-w-[200px]">
            {tooltip}
          </div>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
            {label}
          </p>
          <p
            className={`font-black text-slate-900 mt-1 tabular-nums ${
              size === 'large' ? 'text-3xl' : 'text-2xl'
            }`}
          >
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      {change !== undefined && change !== null && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
          {isPositive && <ArrowUp01Icon className="w-3.5 h-3.5 text-emerald-500" />}
          {isNegative && <ArrowDown01Icon className="w-3.5 h-3.5 text-rose-500" />}
          {isNeutral && <MinusSignIcon className="w-3.5 h-3.5 text-slate-400" />}
          <span
            className={`text-xs font-bold tabular-nums ${
              isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-500'
            }`}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {changeLabel || 'vs previous year'}
          </span>
        </div>
      )}
    </Card>
  );
}

export default function AnalyticsKPIs({ data }: { data: OverviewResponse }) {
  if (!data?.current) return null;

  const { current: c, previous: p } = data;

  const kpis: KPICardProps[] = [
    {
      label: 'Placement Rate',
      value: fmtPct(c.overallPlacementRate),
      subtitle: `${fmt(c.placedStudents)} of ${fmt(c.totalStudents)} students`,
      icon: Target01Icon,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      change: p ? c.overallPlacementRate - p.overallPlacementRate : null,
      tooltip: 'Percentage of total students who received at least one offer',
      size: 'large',
    },
    {
      label: 'Average Package',
      value: fmtLpa(c.averagePackage),
      subtitle: `Median: ${fmtLpa(c.medianPackage)}`,
      icon: Money01Icon,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      change: p && p.averagePackage ? c.averagePackage! - p.averagePackage : null,
      tooltip: 'Mean CTC offered to placed students',
    },
    {
      label: 'Highest Package',
      value: fmtLpa(c.highestPackage),
      icon: Award01Icon,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      change: p && p.highestPackage ? c.highestPackage! - p.highestPackage : null,
    },
    {
      label: 'Total Students',
      value: fmt(c.totalStudents),
      subtitle: `Eligible: ${fmt(c.eligibleStudents)}`,
      icon: UserMultipleIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: p ? c.totalStudents - p.totalStudents : null,
    },
    {
      label: 'Placed Students',
      value: fmt(c.placedStudents),
      subtitle: `Unplaced: ${fmt(c.unplacedStudents)}`,
      icon: Mortarboard01Icon,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      change: p ? c.placedStudents - p.placedStudents : null,
    },
    {
      label: 'Total Offers',
      value: fmt(c.totalOffers),
      icon: Note01Icon,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      change: p ? c.totalOffers - p.totalOffers : null,
    },
    {
      label: 'Companies',
      value: fmt(c.participatingCompanies),
      subtitle:
        c.recruiterRetentionRate != null ? `Retention: ${c.recruiterRetentionRate}%` : undefined,
      icon: Building02Icon,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      change: p ? c.participatingCompanies - p.participatingCompanies : null,
      tooltip: 'Number of unique companies offering placements',
    },
    {
      label: 'Active Drives',
      value: fmt(c.activeDrives),
      icon: Briefcase01Icon,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      tooltip: 'Currently active placement drives',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <KPICard key={i} {...kpi} />
      ))}
    </div>
  );
}
