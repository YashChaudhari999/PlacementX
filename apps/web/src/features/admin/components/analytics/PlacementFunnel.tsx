import { Card } from '@/components/ui';
import { Users, GraduationCap, FileCheck, CheckCircle2 } from 'lucide-react';

export default function PlacementFunnel({ funnelData }: { funnelData: any[] }) {
  if (!funnelData || funnelData.length === 0) return null;

  // Max count is typically the first item (Total Students)
  const maxCount = Math.max(...funnelData.map(d => d.count));

  const getIcon = (stage: string) => {
    if (stage.includes('Total')) return Users;
    if (stage.includes('Eligible')) return GraduationCap;
    if (stage.includes('Participating')) return Users;
    if (stage.includes('Offers')) return FileCheck;
    return CheckCircle2;
  };

  const getColor = (index: number, total: number) => {
    // Gradient from blue-100 to blue-600
    const intensity = Math.round((index / (total - 1)) * 500) + 100;
    return `bg-indigo-${Math.min(intensity, 600)}`;
  };

  return (
    <Card className="p-6 border-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Placement Funnel</h3>
        <p className="text-sm text-slate-500 mt-1">Conversion rates across the placement journey.</p>
      </div>

      <div className="relative pt-4 pb-8 flex flex-col items-center">
        {funnelData.map((stage, index) => {
          const Icon = getIcon(stage.stage);
          // Calculate width percentage relative to max, minimum 20% for readability
          const widthPercent = Math.max((stage.count / maxCount) * 100, 20);

          return (
            <div key={index} className="w-full flex flex-col items-center relative">
              {/* The Funnel Bar */}
              <div 
                className={`relative flex items-center justify-between px-4 py-3 rounded-lg shadow-sm transition-all duration-500`}
                style={{ width: `${widthPercent}%`, minWidth: '280px', backgroundColor: index === 0 ? '#eff6ff' : index === 1 ? '#dbeafe' : index === 2 ? '#bfdbfe' : index === 3 ? '#93c5fd' : '#60a5fa' }}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${index > 2 ? 'bg-white/20' : 'bg-white'}`}>
                    <Icon className={`w-4 h-4 ${index > 2 ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <span className={`font-bold ${index > 2 ? 'text-white' : 'text-blue-900'}`}>{stage.stage}</span>
                </div>
                <span className={`font-black text-lg ${index > 2 ? 'text-white' : 'text-blue-900'}`}>
                  {stage.count.toLocaleString('en-IN')}
                </span>
              </div>

              {/* The connecting arrow with conversion percentage (except for last item) */}
              {index < funnelData.length - 1 && (
                <div className="h-12 w-full flex items-center justify-center relative">
                  <div className="w-0.5 h-full bg-slate-200 absolute"></div>
                  <div className="z-10 bg-white border border-slate-200 rounded-full px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm flex items-center gap-1 relative -top-1">
                    ↓ {funnelData[index + 1].percentage}% Conversion
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
