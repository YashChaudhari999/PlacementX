import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui';
import {
  Building02Icon,
  Calendar01Icon,
  ArrowRight01Icon,
  TickDouble02Icon,
  Clock01Icon,
  CancelCircleIcon,
  MoreHorizontalIcon,
} from 'hugeicons-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { ListSkeleton } from '@/components/common/Skeletons';

export default function StudentApplications() {
  const { user } = useAuthStore();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['studentApplications', user?.id],
    queryFn: async () => {
      const res = await api.get('/student/applications', {});
      return res.data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <ListSkeleton />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'APPLIED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return <TickDouble02Icon className="w-4 h-4 mr-1.5" />;
      case 'REJECTED':
        return <CancelCircleIcon className="w-4 h-4 mr-1.5" />;
      case 'APPLIED':
        return <Clock01Icon className="w-4 h-4 mr-1.5" />;
      default:
        return <MoreHorizontalIcon className="w-4 h-4 mr-1.5" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-8 p-4 md:p-6 pb-20"
    >
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-3xl backdrop-blur-md border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Applications</h1>
          <p className="text-lg text-slate-500 mt-1">
            Track your placement drive applications and current status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.length === 0 ? (
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="p-16 text-center border-dashed border-2 border-slate-300 shadow-md bg-slate-50/50 backdrop-blur-md">
              <div className="text-slate-300 mb-6 flex justify-center">
                <Building02Icon className="w-20 h-20 opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700">No applications yet</h3>
              <p className="text-slate-500 mt-2 text-lg">
                Visit your dashboard to browse active placement drives.
              </p>
              <Link
                to="/student/dashboard"
                className="mt-6 inline-flex items-center justify-center h-12 px-8 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                Browse Drives
              </Link>
            </Card>
          </motion.div>
        ) : (
          applications.map((app, idx) => (
            <motion.div key={app.id} variants={itemVariants} custom={idx} whileHover={{ y: -5 }}>
              <Link to={`/student/drives/${app.driveId}`} className="block h-full">
                <Card className="h-full p-6 flex flex-col justify-between border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 group">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-300">
                        <Building02Icon className="w-7 h-7 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center shadow-sm ${getStatusColor(app.status)}`}
                      >
                        {getStatusIcon(app.status)}
                        {app.status.replace('_', ' ')}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-xl text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {app.drive.company?.name}
                      </h3>
                      <p className="text-md font-semibold text-slate-500 mt-1 line-clamp-1">
                        {app.drive.jobRole}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                      <Calendar01Icon className="w-4 h-4 text-slate-300" />
                      Applied:{' '}
                      {new Date(app.appliedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <ArrowRight01Icon className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
