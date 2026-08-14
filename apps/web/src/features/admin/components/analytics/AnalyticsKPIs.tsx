import { ArrowUpRight, ArrowDownRight, Users, GraduationCap, Briefcase, IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui';

interface AnalyticsKPIsProps {
  overview: any;
}

const KPICard = ({ label, current, previous, icon: Icon, unit = '', format = 'number', invertColors = false }: any) => {
  const currentVal = current ?? 0;
  const previousVal = previous ?? 0;
  
  let changeValue = 0;
  let isPositive = true;
  let isPercentagePoint = false;
  
  if (previousVal > 0) {
    if (format === 'percentage') {
      // Percentage points
      changeValue = currentVal - previousVal;
      isPositive = changeValue >= 0;
      isPercentagePoint = true;
    } else {
      // Percentage growth
      changeValue = ((currentVal - previousVal) / previousVal) * 100;
      isPositive = changeValue >= 0;
    }
  }

  // Reverse color logic for things like Unplaced Students
  let positiveColor = invertColors ? 'text-rose-600' : 'text-emerald-600';
  let positiveBg = invertColors ? 'bg-rose-50' : 'bg-emerald-50';
  let negativeColor = invertColors ? 'text-emerald-600' : 'text-rose-600';
  let negativeBg = invertColors ? 'bg-emerald-50' : 'bg-rose-50';

  const formatDisplay = (val: number) => {
    if (format === 'percentage') return `${val.toFixed(1)}%`;
    if (format === 'currency') return `₹${val.toFixed(2)} LPA`;
    return val.toLocaleString('en-IN');
  };

  return (
    <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        
        {previousVal > 0 && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isPositive ? positiveBg + ' ' + positiveColor : negativeBg + ' ' + negativeColor}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(changeValue).toFixed(1)}{isPercentagePoint ? 'pp' : '%'}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="flex items-end gap-3 mt-1">
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatDisplay(currentVal)}</h3>
          {previousVal > 0 && (
            <p className="text-sm font-semibold text-slate-400 mb-1 line-through decoration-slate-300">
              {formatDisplay(previousVal)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default function AnalyticsKPIs({ overview }: AnalyticsKPIsProps) {
  if (!overview?.current) return null;

  const current = overview.current;
  const previous = overview.previous;

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">Executive Placement Overview</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Total Students" 
          current={current.totalStudents} 
          previous={previous?.totalStudents} 
          icon={Users} 
        />
        <KPICard 
          label="Eligible Students" 
          current={current.eligibleStudents} 
          previous={previous?.eligibleStudents} 
          icon={GraduationCap} 
        />
        <KPICard 
          label="Placed Students" 
          current={current.placedStudents} 
          previous={previous?.placedStudents} 
          icon={Briefcase} 
        />
        <KPICard 
          label="Unplaced Students" 
          current={current.unplacedStudents} 
          previous={previous?.unplacedStudents} 
          icon={AlertTriangle} 
          invertColors={true}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard 
          label="Placement Rate" 
          current={current.placementRate} 
          previous={previous?.placementRate} 
          icon={TrendingUp} 
          format="percentage"
        />
        <KPICard 
          label="Average Package" 
          current={current.averagePackage} 
          previous={previous?.averagePackage} 
          icon={IndianRupee} 
          format="currency"
        />
        <KPICard 
          label="Highest Package" 
          current={current.highestPackage} 
          previous={previous?.highestPackage} 
          icon={IndianRupee} 
          format="currency"
        />
      </div>
    </div>
  );
}
