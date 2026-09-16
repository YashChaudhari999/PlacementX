import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
 Building02Icon,
 Mortarboard01Icon,
 Briefcase01Icon,
 ArrowUp01Icon,
 Note01Icon,
 TickDouble02Icon,
 Clock01Icon,
 Calendar01Icon,
 UserMultipleIcon,
 Award01Icon,
 Activity01Icon,
 Money01Icon,
 Building01Icon,
 RefreshIcon,
 ArrowRight01Icon,
} from 'hugeicons-react';
import { Card, Button, EmptyState } from '@/components/ui';
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
 hidden: { opacity: 0, y: 10 },
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

// --- Skeleton Components ---
const StatCardSkeleton = () => (
 <Card className="p-6 flex flex-col justify-between animate-pulse">
 <div className="flex items-start justify-between">
 <div className="space-y-3 w-full">
 <div className="h-4 bg-muted rounded w-1/2"></div>
 <div className="h-8 bg-muted rounded w-3/4"></div>
 </div>
 <div className="p-3 rounded-xl bg-muted h-12 w-12 shrink-0"></div>
 </div>
 <div className="mt-6 h-4 bg-muted rounded w-2/3"></div>
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
 onClick?: () => void;
}

const StatCard = ({
 label,
 value,
 icon: Icon,
 trend,
 colorClass,
 bgClass,
 onClick,
}: StatCardProps) => (
 <Card
 onClick={onClick}
 className={`p-6 flex flex-col h-full min-h-[160px] justify-between transition-all duration-300 group overflow-hidden ${
 onClick ? 'cursor-pointer hover:border-primary/50 hover:shadow-md' : ''
 }`}
 >
 <div className="flex items-start justify-between relative z-10">
 <div className="flex flex-col">
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
 {label}
 </p>
 <p className="text-3xl font-black text-foreground tracking-tight group-hover:scale-[1.02] transition-transform origin-left">
 {value}
 </p>
 </div>
 <div
 className={`w-12 h-12 rounded-lg ${bgClass} transition-colors flex items-center justify-center shrink-0 shadow-sm border border-border`}
 >
 <Icon className={`h-6 w-6 ${colorClass}`} />
 </div>
 </div>
 {trend && (
 <div className="mt-6 flex items-center text-sm relative z-10">
 <span
 className={`text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border`}
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
 <div className="flex flex-col items-center justify-center min-h-[400px]">
 <EmptyState
 icon={<Activity01Icon className="h-10 w-10"/>}
 title="Failed to load dashboard"
 description={
 error?.message || 'An unexpected error occurred while connecting to the server.'
 }
 action={
 <Button onClick={() => refetch()}>
 <RefreshIcon className="w-4 h-4 mr-2"/> Try Again
 </Button>
 }
 />
 </div>
 );
 }

 const formatNum = (num: number) => num.toLocaleString('en-IN');

 return (
 <div className="space-y-8 pb-12">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
 <div>
 <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
 <p className="text-muted-foreground text-sm mt-1">
 Real-time metrics for placement drives, students, and offers.
 </p>
 </div>

 <div className="flex items-center gap-4">
 {dataUpdatedAt && (
 <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-md border border-border">
 <Clock01Icon className="w-3.5 h-3.5"/>
 Last updated:{' '}
 {new Date(dataUpdatedAt).toLocaleTimeString([], {
 hour: '2-digit',
 minute: '2-digit',
 })}
 </div>
 )}
 <Button
 variant="outline"
 size="sm"
 onClick={() => refetch()}
 disabled={isRefetching || isLoading}
 >
 <RefreshIcon className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
 <span className="hidden sm:inline">Refresh</span>
 </Button>
 </div>
 </div>

 <motion.div
 variants={containerVariants}
 initial="hidden"
 animate="show"
 className="space-y-10"
 >
 {/* SECTION 1: DRIVES */}
 <section>
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
 <Calendar01Icon className="w-5 h-5 text-muted-foreground"/> Drives
 </h2>
 <Button
 variant="link"
 size="sm"
 onClick={() => navigate('/admin/placement-events')}
 className="text-primary"
 >
 View All <ArrowRight01Icon className="w-4 h-4 ml-1"/>
 </Button>
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
 colorClass="text-success"
 bgClass="bg-success-muted"
 onClick={() => navigate('/admin/placement-events')}
 />
 </motion.div>
 <motion.div variants={itemVariants}>
 <StatCard
 label="Upcoming Drives"
 value={formatNum(data?.drives?.upcoming || 0)}
 icon={Calendar01Icon}
 trend="Registration Starts Soon"
 colorClass="text-info"
 bgClass="bg-info-muted"
 onClick={() => navigate('/admin/placement-events')}
 />
 </motion.div>
 <motion.div variants={itemVariants}>
 <StatCard
 label="Closed Drives"
 value={formatNum(data?.drives?.closed || 0)}
 icon={Clock01Icon}
 trend="Registration Closed"
 colorClass="text-muted-foreground"
 bgClass="bg-muted"
 onClick={() => navigate('/admin/placement-events')}
 />
 </motion.div>
 </div>
 )}
 </section>

 {/* SECTION 2: STUDENTS */}
 <section>
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
 <UserMultipleIcon className="w-5 h-5 text-muted-foreground"/> Students
 </h2>
 <Button
 variant="link"
 size="sm"
 onClick={() => navigate('/admin/students')}
 className="text-primary"
 >
 Manage Students <ArrowRight01Icon className="w-4 h-4 ml-1"/>
 </Button>
 </div>

 {isLoading ? (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
 <StatCardSkeleton />
 <StatCardSkeleton />
 </div>
 ) : (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
 <motion.div variants={itemVariants} className="h-full">
 <Card className="p-0 overflow-hidden flex flex-col h-full border-border">
 <div className="p-4 border-b border-border flex justify-between items-center bg-card">
 <div>
 <h3 className="font-bold text-foreground text-base">
 Eligible Students by Company
 </h3>
 <p className="text-xs text-muted-foreground mt-0.5">
 For active & upcoming drives
 </p>
 </div>
 </div>
 <div className="flex-1 p-4 bg-muted/30">
 {data?.students?.eligibleByCompany?.length > 0 ? (
 <motion.div
 variants={listVariants}
 initial="hidden"
 animate="show"
 className="space-y-2"
 >
 {data.students.eligibleByCompany.map((item: any, idx: number) => (
 <motion.div
 variants={listItemVariants}
 key={idx}
 className="flex items-center justify-between bg-card px-4 py-3 rounded-md border border-border hover:border-primary/50 transition-colors group cursor-pointer"
 onClick={() =>
 item.driveId
 ? navigate(`/admin/placement-events/${item.driveId}`)
 : navigate('/admin/placement-events')
 }
 >
 <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
 {item.company}
 </span>
 <span className="font-bold text-sm bg-muted px-2.5 py-1 rounded border border-border">
 {formatNum(item.count)}
 </span>
 </motion.div>
 ))}
 </motion.div>
 ) : (
 <EmptyState
 icon={<TickDouble02Icon className="w-8 h-8"/>}
 title="No active drives"
 description="When drives are open or upcoming, eligible student counts will appear here."
 />
 )}
 </div>
 </Card>
 </motion.div>

 <motion.div variants={itemVariants} className="h-full">
 <Card className="p-0 overflow-hidden flex flex-col h-full border-border">
 <div className="p-4 border-b border-border flex justify-between items-center bg-card">
 <div>
 <h3 className="font-bold text-foreground text-base">
 Applications by Company
 </h3>
 <p className="text-xs text-muted-foreground mt-0.5">
 Top recruiters by volume
 </p>
 </div>
 </div>
 <div className="flex-1 p-4 bg-muted/30">
 {data?.students?.applicationsByCompany?.length > 0 ? (
 <motion.div
 variants={listVariants}
 initial="hidden"
 animate="show"
 className="space-y-2"
 >
 {data.students.applicationsByCompany.map((item: any, idx: number) => (
 <motion.div
 variants={listItemVariants}
 key={idx}
 className="flex items-center justify-between bg-card px-4 py-3 rounded-md border border-border hover:border-primary/50 transition-colors group cursor-pointer"
 onClick={() =>
 item.driveId
 ? navigate(`/admin/placement-events/${item.driveId}`)
 : navigate('/admin/placement-events')
 }
 >
 <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
 {item.company}
 </span>
 <span className="font-bold text-sm bg-muted px-2.5 py-1 rounded border border-border">
 {formatNum(item.applications)}
 </span>
 </motion.div>
 ))}
 </motion.div>
 ) : (
 <EmptyState
 icon={<Note01Icon className="w-8 h-8"/>}
 title="No applications yet"
 description="When students apply to drives, the top companies will appear here."
 />
 )}
 </div>
 </Card>
 </motion.div>
 </div>
 )}
 </section>

 {/* SECTION 3: PACKAGES */}
 <section>
 <div className="mb-4">
 <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
 <Award01Icon className="w-5 h-5 text-muted-foreground"/> Placement Packages
 </h2>
 </div>

 {isLoading ? (
 <SectionSkeleton count={4} />
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 <motion.div variants={itemVariants}>
 <StatCard
 label="Placement %"
 value={`${data?.packages?.placementPercentage || 0}%`}
 icon={Mortarboard01Icon}
 colorClass="text-primary"
 bgClass="bg-primary/10"
 />
 </motion.div>
 <motion.div variants={itemVariants}>
 <StatCard
 label="Highest Package"
 value={`${data?.packages?.highest || 0} LPA`}
 icon={ArrowUp01Icon}
 colorClass="text-accent"
 bgClass="bg-accent/20"
 />
 </motion.div>
 <motion.div variants={itemVariants}>
 <StatCard
 label="Average Package"
 value={`${data?.packages?.average || 0} LPA`}
 icon={Activity01Icon}
 colorClass="text-success"
 bgClass="bg-success-muted"
 />
 </motion.div>
 <motion.div variants={itemVariants}>
 <StatCard
 label="Median Package"
 value={`${data?.packages?.median || 0} LPA`}
 icon={Money01Icon}
 colorClass="text-info"
 bgClass="bg-info-muted"
 />
 </motion.div>
 </div>
 )}
 </section>
 </motion.div>
 </div>
 );
}
