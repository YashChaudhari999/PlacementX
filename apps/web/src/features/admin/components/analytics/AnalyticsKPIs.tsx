import { Card } from '@/components/ui';
import { 
  Users, Briefcase, GraduationCap, IndianRupee, Activity, TrendingUp, TrendingDown, Building2 
} from 'lucide-react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

interface KpiData {
  current: number;
  previous: number;
}

interface KPIProps {
  summary: {
    eligibleStudents: KpiData;
    appliedStudents: KpiData;
    placedStudents: KpiData;
    placementPercentage: KpiData;
    totalOffers: KpiData;
    highestPackage: KpiData;
    averagePackage: KpiData;
    medianPackage: KpiData;
    companiesVisited: KpiData;
    newRecruiters: KpiData;
  };
}

const KPICard = ({ title, data, icon: Icon, color, isCurrency = false, isPercent = false }: any) => {
  const current = data.current;
  const previous = data.previous;
  const diff = current - previous;
  const percentChange = previous > 0 ? (diff / previous) * 100 : (current > 0 ? 100 : 0);
  
  const isPositive = diff >= 0;
  
  const formatVal = (v: number) => {
    if (isCurrency) return `${v} LPA`;
    if (isPercent) return `${v}%`;
    return v.toLocaleString('en-IN');
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="p-5 border-slate-200 hover:shadow-lg transition-all duration-300 group">
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <div className={`p-2 rounded-lg ${color.bg} ${color.text} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex items-end gap-3">
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatVal(current)}</h3>
          {previous > 0 && (
            <div className={`flex items-center gap-1 text-sm font-bold pb-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(percentChange).toFixed(1)}%
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Previous Year</span>
          <span className="text-slate-600">{formatVal(previous)}</span>
        </div>
      </Card>
    </motion.div>
  );
};

export default function AnalyticsKPIs({ summary }: KPIProps) {
  if (!summary) return null;
  
  return (
    <motion.div 
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
    >
      <KPICard title="Total Eligible" data={summary.eligibleStudents} icon={Users} color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} />
      <KPICard title="Total Applied" data={summary.appliedStudents} icon={Activity} color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }} />
      <KPICard title="Total Offers" data={summary.totalOffers} icon={Briefcase} color={{ bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' }} />
      <KPICard title="Placed Students" data={summary.placedStudents} icon={GraduationCap} color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} />
      <KPICard title="Placement %" data={summary.placementPercentage} icon={TrendingUp} isPercent color={{ bg: 'bg-teal-50', text: 'text-teal-600' }} />
      
      <KPICard title="Highest Package" data={summary.highestPackage} icon={IndianRupee} isCurrency color={{ bg: 'bg-purple-50', text: 'text-purple-600' }} />
      <KPICard title="Average Package" data={summary.averagePackage} icon={IndianRupee} isCurrency color={{ bg: 'bg-pink-50', text: 'text-pink-600' }} />
      <KPICard title="Median Package" data={summary.medianPackage} icon={IndianRupee} isCurrency color={{ bg: 'bg-rose-50', text: 'text-rose-600' }} />
      <KPICard title="Companies Visited" data={summary.companiesVisited} icon={Building2} color={{ bg: 'bg-amber-50', text: 'text-amber-600' }} />
      <KPICard title="New Recruiters" data={summary.newRecruiters} icon={Building2} color={{ bg: 'bg-orange-50', text: 'text-orange-600' }} />
    </motion.div>
  );
}
