import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building02Icon, Mortarboard01Icon, Briefcase01Icon, ArrowUp01Icon, Note01Icon, TickDouble02Icon, Clock01Icon, Calendar01Icon, UserMultipleIcon, Award01Icon, Activity01Icon, Money01Icon, Building01Icon, RefreshIcon, ArrowRight01Icon } from 'hugeicons-react';
import { Card } from '@/components/ui';
import { EmptyState } from '@/components/common/EmptyState';
import { adminService } from '@/services/admin.service';
// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

// Helper function to get distinct colors based on text
const getAvatarColors = (text: string) => {
  const colors = [
    'from-indigo-100 to-indigo-50 text-indigo-700 border-indigo-200/60',
    'from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/60',
    'from-rose-100 to-rose-50 text-rose-700 border-rose-200/60',
    'from-amber-100 to-amber-50 text-amber-700 border-amber-200/60',
    'from-purple-100 to-purple-50 text-purple-700 border-purple-200/60',
    'from-blue-100 to-blue-50 text-blue-700 border-blue-200/60',
    'from-cyan-100 to-cyan-50 text-cyan-700 border-cyan-200/60',
  ];
  const charCodeSum = text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
};

// --- Skeleton Components ---
const StatCardSkeleton = () => (
  <Card className="p-6 flex flex-col justify-between animate-pulse border-slate-100">
    <div className="flex items-start justify-between">
      <div className="space-y-3 w-full">
        <div className="h-4 bg-slate-200/60 rounded w-1/2"></div>
        <div className="h-8 bg-slate-200/80 rounded w-3/4"></div>
      </div>
      <div className="p-3 rounded-xl bg-slate-100/80 h-12 w-12 shrink-0"></div>
    </div>
    <div className="mt-6 h-4 bg-slate-100/80 rounded w-2/3"></div>
  </Card>
);

const SectionSkeleton = ({ count = 3 }: { count?: number }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count === 3 ? '3' : count === 4 ? '4' : '2'} gap-6`}
  >
    {Array.from({ length: count }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

// --- StatCard Component ---
interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
  colorClass: string;
  bgClass: string;
  trendColor?: string;
  chartData?: { value: number }[];
  chartColor?: string;
  onClick?: () => void;
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  colorClass,
  bgClass,
  trendColor = 'text-emerald-600',
  chartData,
  chartColor = '#6366f1',
  onClick,
}: StatCardProps) => (
  <Card
    onClick={onClick}
    className={`p-6 flex flex-col h-full min-h-[160px] justify-between transition-all duration-300 group relative overflow-hidden bg-white border-slate-200 rounded-2xl ${
      onClick ? 'cursor-pointer hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1' : ''
    }`}
  >
    {/* Animated Wave Background */}
    <div className="absolute inset-x-0 bottom-0 overflow-hidden h-24 rounded-b-2xl pointer-events-none z-0">
      <motion.svg
        className="absolute bottom-0 w-[200%] h-full origin-bottom"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        initial={{ x: "0%" }}
        animate={{ x: "-50%" }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 10
        }}
      >
        <path
          d="M0,40 C300,100 300,0 600,40 C900,80 900,0 1200,40 L1200,120 L0,120 Z"
          fill={chartColor}
          opacity="0.1"
        />
        <path
          d="M0,60 C300,20 300,120 600,60 C900,0 900,100 1200,60 L1200,120 L0,120 Z"
          fill={chartColor}
          opacity="0.15"
        />
      </motion.svg>
    </div>

    <div className="flex items-start justify-between relative z-10">
      <div className="flex flex-col">
        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tight group-hover:scale-[1.03] transition-transform origin-left">
          {value}
        </p>
      </div>
      <div
        className={`w-14 h-14 rounded-full ${bgClass} transition-colors group-hover:bg-opacity-80 flex items-center justify-center shrink-0 shadow-sm`}
      >
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-6 flex items-center text-sm relative z-10">
        <span
          className={`${trendColor} font-bold bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1 shadow-sm border border-slate-100/50`}
        >
          {trend}
        </span>
      </div>
    )}
  </Card>
);

// --- Main Dashboard Component ---
export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, dataUpdatedAt, refetch, isRefetching } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      return adminService.getDashboard();
    },
    refetchInterval: 60000,
  });

  if (isError) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6 ring-8 ring-red-50/50">
          <Activity01Icon className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Failed to load dashboard</h2>
        <p className="text-slate-500 mt-3 max-w-md">
          {error?.message || 'An unexpected error occurred while connecting to the server.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
        >
          <RefreshIcon className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const formatNum = (num: number) => num.toLocaleString('en-IN');

  return (
    <div className="space-y-12 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
            Real-time metrics for placement drives, students, and offers.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {dataUpdatedAt && (
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Clock01Icon className="w-3.5 h-3.5" />
              Last updated:{' '}
              {new Date(dataUpdatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-bold border border-slate-200 hover:border-indigo-200 hover:shadow-sm bg-white"
            title="Refresh Dashboard"
          >
            <RefreshIcon
              className={`w-4 h-4 ${isRefetching ? 'animate-spin text-indigo-600' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-12"
      >
        {/* SECTION 1: DRIVES */}
        <section>
          <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-100 rounded-md">
                <Calendar01Icon className="w-5 h-5 text-indigo-600" />
              </div>{' '}
              Drives
            </h2>
            <button
              onClick={() => navigate('/admin/placement-events')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight01Icon className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <SectionSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Open Drives"
                  value={formatNum(data?.drives?.open || 0)}
                  icon={Briefcase01Icon}
                  trend="Accepting Applications"
                  colorClass="text-emerald-600"
                  bgClass="bg-emerald-50"
                  trendColor="text-emerald-700"
                  chartColor="#10b981"
                  chartData={[{value: 4}, {value: 3}, {value: 5}, {value: 8}, {value: 7}, {value: 10}]}
                  onClick={() => navigate('/admin/placement-events')}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Upcoming Drives"
                  value={formatNum(data?.drives?.upcoming || 0)}
                  icon={Calendar01Icon}
                  trend="Registration Starts Soon"
                  colorClass="text-blue-600"
                  bgClass="bg-blue-50"
                  trendColor="text-blue-700"
                  chartColor="#3b82f6"
                  chartData={[{value: 2}, {value: 5}, {value: 3}, {value: 7}, {value: 4}, {value: 8}]}
                  onClick={() => navigate('/admin/placement-events')}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Closed Drives"
                  value={formatNum(data?.drives?.closed || 0)}
                  icon={Clock01Icon}
                  trend="Registration Closed"
                  colorClass="text-indigo-600"
                  bgClass="bg-indigo-50"
                  trendColor="text-indigo-700"
                  chartColor="#6366f1"
                  chartData={[{value: 1}, {value: 3}, {value: 2}, {value: 4}, {value: 6}, {value: 5}]}
                  onClick={() => navigate('/admin/placement-events')}
                />
              </motion.div>
            </div>
          )}
        </section>

        {/* SECTION 2: STUDENTS */}
        <section>
          <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-100 rounded-md">
                <UserMultipleIcon className="w-5 h-5 text-amber-600" />
              </div>{' '}
              Students
            </h2>
            <button
              onClick={() => navigate('/admin/students')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
            >
              Manage Students <ArrowRight01Icon className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="h-full">
                <Card className="p-0 overflow-hidden flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                      <h3 className="font-bold text-slate-800">Eligible Students by Company</h3>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        For active & upcoming drives
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <TickDouble02Icon className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50/50 p-5">
                    {data?.students?.eligibleByCompany?.length > 0 ? (
                      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
                        {data.students.eligibleByCompany.map((item: any, idx: number) => (
                          <motion.div
                            variants={listItemVariants}
                            key={idx}
                            className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 transition-all group cursor-pointer"
                            onClick={() => navigate('/admin/placement-events')}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center font-black text-sm uppercase shadow-inner border ${getAvatarColors(item.company)}`}>
                                {item.company.substring(0, 2)}
                              </div>
                              <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.company}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-lg text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100/50">
                                {formatNum(item.count)}
                              </span>
                              <ArrowRight01Icon className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-10">
                        <EmptyState
                          icon={TickDouble02Icon}
                          title="No active drives"
                          description="When drives are open or upcoming, eligible student counts will appear here."
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="h-full">
                <Card className="p-0 overflow-hidden flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                      <h3 className="font-bold text-slate-800">Applications by Company</h3>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Top recruiters by volume
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Building02Icon className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50/50 p-5">
                    {data?.students?.applicationsByCompany?.length > 0 ? (
                      <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
                        {data.students.applicationsByCompany.map((item: any, idx: number) => (
                          <motion.div
                            variants={listItemVariants}
                            key={idx}
                            className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 transition-all group cursor-pointer"
                            onClick={() => navigate('/admin/placement-events')}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center font-black text-sm uppercase shadow-inner border ${getAvatarColors(item.company)}`}>
                                {item.company.substring(0, 2)}
                              </div>
                              <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.company}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-lg text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100/50">
                                {formatNum(item.applications)}
                              </span>
                              <ArrowRight01Icon className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-10">
                        <EmptyState
                          icon={Note01Icon}
                          title="No applications yet"
                          description="When students apply to drives, the top companies will appear here."
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </section>

        {/* SECTION 3: PACKAGES */}
        <section>
          <div className="mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
              <div className="p-1.5 bg-rose-100 rounded-md">
                <Award01Icon className="w-5 h-5 text-rose-600" />
              </div>{' '}
              Placement Packages
            </h2>
          </div>

          {isLoading ? (
            <SectionSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Placement Percentage"
                  value={`${data?.packages?.placementPercentage || 0}%`}
                  icon={Mortarboard01Icon}
                  trend="Target: 95%"
                  colorClass="text-rose-600"
                  bgClass="bg-rose-50"
                  trendColor="text-rose-700"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Highest Package"
                  value={`${data?.packages?.highest || 0} LPA`}
                  icon={ArrowUp01Icon}
                  trend="Maximum Offer"
                  colorClass="text-purple-600"
                  bgClass="bg-purple-50"
                  trendColor="text-purple-700"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Average Package"
                  value={`${data?.packages?.average || 0} LPA`}
                  icon={Activity01Icon}
                  trend="Across all offers"
                  colorClass="text-fuchsia-600"
                  bgClass="bg-fuchsia-50"
                  trendColor="text-fuchsia-700"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Median Package"
                  value={`${data?.packages?.median || 0} LPA`}
                  icon={Money01Icon}
                  trend="Middle value"
                  colorClass="text-pink-600"
                  bgClass="bg-pink-50"
                  trendColor="text-pink-700"
                />
              </motion.div>
            </div>
          )}
        </section>

        {/* SECTION 4: OVERALL STATISTICS */}
        <section>
          <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
              <div className="p-1.5 bg-cyan-100 rounded-md">
                <Building01Icon className="w-5 h-5 text-cyan-600" />
              </div>{' '}
              Overall Statistics
            </h2>
            <button
              onClick={() => navigate('/admin/reports')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
            >
              View Reports <ArrowRight01Icon className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <SectionSkeleton count={2} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total Companies Visited"
                  value={formatNum(data?.overall?.companiesVisited || 0)}
                  icon={Building02Icon}
                  trend="Across all seasons"
                  colorClass="text-cyan-600"
                  bgClass="bg-cyan-50"
                  trendColor="text-cyan-700"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total Offers"
                  value={formatNum(data?.overall?.totalOffers || 0)}
                  icon={Note01Icon}
                  trend="Dream, Super Dream, PPO"
                  colorClass="text-teal-600"
                  bgClass="bg-teal-50"
                  trendColor="text-teal-700"
                />
              </motion.div>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
