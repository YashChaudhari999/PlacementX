import { Card } from '@/components/ui';

export const ListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i} className="p-6 h-[220px] flex flex-col justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-slate-200 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200 rounded-md w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded-md w-full" />
          <div className="h-4 bg-slate-200 rounded-md w-4/5" />
        </div>
      </Card>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded-md w-48" />
        <div className="h-4 bg-slate-200 rounded-md w-64" />
      </div>
      <div className="h-10 w-32 bg-slate-200 rounded-xl" />
    </div>
    <Card className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-md w-24" />
            <div className="h-10 bg-slate-200 rounded-xl w-full" />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-8 bg-slate-200 rounded-md w-64" />
      <div className="h-4 bg-slate-200 rounded-md w-48" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 md:col-span-2 min-h-[300px]" />
      <Card className="p-6 min-h-[300px]" />
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6 h-[120px]" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 h-[400px]" />
      <Card className="p-6 h-[400px]" />
    </div>
  </div>
);
