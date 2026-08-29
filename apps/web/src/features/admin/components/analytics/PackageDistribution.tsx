import { Card } from '@/components/ui';

export default function PackageDistribution({ packages }: { packages: any }) {
  if (!packages?.current?.distribution) return null;

  const currentDist = packages.current.distribution;
  const previousDist = packages.previous?.distribution;

  const labels = Object.keys(currentDist);
  const maxVal = Math.max(
    ...(Object.values(currentDist) as number[]),
    ...(previousDist ? (Object.values(previousDist) as number[]) : [0])
  );

  return (
    <Card className="p-6 border-slate-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Package Distribution</h3>
        <p className="text-sm text-slate-500 mt-1">
          Histogram of salary ranges for placed students.
        </p>
      </div>

      <div className="flex items-end gap-2 h-64 mt-8">
        {labels.map((label, i) => {
          const cVal = currentDist[label] as number;
          const pVal = previousDist ? (previousDist[label] as number) : 0;

          const cHeight = maxVal > 0 ? (cVal / maxVal) * 100 : 0;
          const pHeight = maxVal > 0 ? (pVal / maxVal) * 100 : 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group h-full relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-12 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                <div className="mb-1 text-slate-300">{label}</div>
                <div className="flex gap-3">
                  {previousDist && <span>Prev: {pVal}</span>}
                  <span className="text-indigo-300">Curr: {cVal}</span>
                </div>
              </div>

              <div className="flex items-end justify-center w-full gap-1 h-full pt-4">
                {previousDist && (
                  <div
                    className="w-1/3 bg-slate-200 rounded-t-sm transition-all duration-500"
                    style={{ height: `${Math.max(pHeight, 2)}%` }}
                  ></div>
                )}
                <div
                  className="w-1/3 bg-indigo-500 rounded-t-sm transition-all duration-500 hover:bg-indigo-400"
                  style={{ height: `${Math.max(cHeight, 2)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-500 mt-3 text-center whitespace-nowrap truncate w-full px-1">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {previousDist && (
        <div className="mt-6 flex justify-center gap-6 text-sm font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 rounded-sm"></div> Previous Year
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> Current Year
          </div>
        </div>
      )}
    </Card>
  );
}
